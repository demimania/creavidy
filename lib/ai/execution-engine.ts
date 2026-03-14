// ============================================================================
// Node Execution Engine — Connects workspace nodes to API routes
// Handles sequential/parallel execution, status updates, and credit tracking
// ============================================================================

import { useWorkspaceStore, type NodeData } from '@/lib/stores/workspace-store'
import type { Node, Edge } from 'reactflow'
import { withRetry, isRetryableError } from '@/lib/utils/retry'

// ── Types ────────────────────────────────────────────────────────────────────

interface ExecutionResult {
  nodeId: string
  success: boolean
  outputUrl?: string
  error?: string
  creditsUsed: number
}

// ── API endpoint mapping per node type ───────────────────────────────────────

const NODE_API_MAP: Record<string, string> = {
  script:      '/api/generate/script',
  voice:       '/api/generate/tts',
  imageGen:    '/api/generate/image',
  videoGen:    '/api/generate/video',
  caption:     '/api/generate/caption',
  export:      '/api/generate/video',  // export uses final composited video
  videoBrief:  '/api/generate/script',
  imageEdit:          '/api/generate/image-edit',
  fluxKontextNode:    '/api/generate/image-edit',
  briaRemoveBgNode:   '/api/generate/image-edit',
  upscaleNode:        '/api/generate/image-edit',
  fluxFillProNode:    '/api/generate/image-edit',
  // Video Edit nodes
  videoEdit:              '/api/generate/video-edit',
  lipSyncLatentSyncNode:  '/api/generate/video-edit',
  videoToVideoWanNode:    '/api/generate/video-edit',
  videoUpscaleNode:       '/api/generate/video-edit',
  videoEnhanceRifeNode:   '/api/generate/video-edit',
}

// ── Build body from node config ─────────────────────────────────────────────

function buildRequestBody(node: Node<NodeData>, parentOutputs: Record<string, string>): Record<string, unknown> {
  const config = node.data.config as unknown as Record<string, unknown>

  switch (node.data.type) {
    case 'script':
      return {
        model: config.model,
        prompt: config.prompt || 'Generate a professional video script',
        sceneCount: config.sceneCount,
        language: config.language,
      }

    case 'voice':
      return {
        engine: (config.engine as string) || 'openai-tts',
        text: parentOutputs[Object.keys(parentOutputs)[0]] || (config.text as string) || 'Sample narration text',
        voiceId: config.voiceId,
        speed: config.speed,
      }

    case 'imageGen': {
      const c = config as Record<string, any>
      return {
        model: c.model,
        prompt: parentOutputs[Object.keys(parentOutputs)[0]] || c.prompt || 'Generate an image',
        width: c.resolution === 'custom' ? 1024 : parseInt(String(c.resolution).split('x')[0]) || 1024,
        height: c.resolution === 'custom' ? 1024 : parseInt(String(c.resolution).split('x')[1]) || 1024,
        style: c.style,
      }
    }

    case 'videoGen': {
      const c = config as Record<string, any>
      return {
        model: c.model,
        prompt: parentOutputs[Object.keys(parentOutputs)[0]] || c.prompt || 'Generate a video',
        duration: c.duration,
        resolution: c.resolution,
        fps: c.fps,
        imageUrl: Object.values(parentOutputs).find(url => url?.match(/\.(jpg|jpeg|png|webp)/i) || url?.includes('fal.media')) || undefined,
      }
    }

    case 'videoBrief': {
      const c = config as Record<string, any>
      const durationToScenes: Record<string, number> = { '30': 3, '60': 5, '180': 10 }
      return {
        model: 'gemini-2.0',
        prompt: `${c.prompt || ''}${c.theme ? '. Theme: ' + c.theme : ''}${c.visualStyle ? '. Visual style: ' + c.visualStyle : ''}. IMPORTANT: Each scene MUST be strictly 10 seconds or less.`,
        sceneCount: durationToScenes[String(c.duration)] || 5,
        language: c.language || 'English',
      }
    }

    case 'caption':
      return {
        engine: 'openai-tts',
        text: parentOutputs[Object.keys(parentOutputs)[0]] || '',
      }

    case 'export':
      return {
        format: config.format,
        quality: config.quality,
        videoUrl: Object.values(parentOutputs)[0] || '',
        includeAudio: config.includeAudio,
        includeCaptions: config.includeCaptions,
      }

    case 'imageEdit': {
      const c = config as Record<string, any>
      return {
        editType: c.editType || 'kontext',
        imageUrl: Object.values(parentOutputs).find(url => url?.match(/\.(jpg|jpeg|png|webp)/i) || url?.includes('fal.media') || url?.includes('cdn')) || c.imageUrl || '',
        prompt: c.prompt,
        maskUrl: c.maskUrl,
        scale: c.scale || 2,
      }
    }

    case 'videoEdit':
    case 'lipSyncLatentSyncNode':
    case 'videoToVideoWanNode':
    case 'videoUpscaleNode':
    case 'videoEnhanceRifeNode': {
      const c = config as Record<string, any>
      // Infer editType from node type if not in config
      const editTypeMap: Record<string, string> = {
        lipSyncLatentSyncNode: 'lipsync',
        videoToVideoWanNode: 'v2v',
        videoUpscaleNode: 'upscale',
        videoEnhanceRifeNode: 'enhance',
      }
      const resolvedEditType = c.editType || editTypeMap[node.data.type] || 'enhance'
      const videoInputUrl = Object.values(parentOutputs).find(url => url?.match(/\.(mp4|webm|mov)/i) || url?.includes('fal.media')) || c.videoUrl || ''
      const audioInputUrl = Object.values(parentOutputs).find(url => url?.match(/\.(mp3|wav|ogg)/i)) || c.audioUrl || ''
      return {
        editType: resolvedEditType,
        videoUrl: videoInputUrl,
        audioUrl: audioInputUrl,
        prompt: c.prompt || '',
        strength: c.strength ?? 0.7,
        scale: c.scale ?? 2,
      }
    }

    case 'textIterator':
      return { items: (config as any).items?.split('\n').filter(Boolean) }

    case 'imageIterator':
      return {
        prompts: (config as any).prompts?.split('\n').filter(Boolean),
        model: (config as any).model || 'fal-ai/flux/schnell',
      }

    default:
      return {}
  }
}

// ── Get topological order for execution ─────────────────────────────────────

function getExecutionOrder(nodes: Node<NodeData>[], edges: Edge[]): string[] {
  const inDegree: Record<string, number> = {}
  const adjacencyList: Record<string, string[]> = {}

  nodes.forEach(n => {
    inDegree[n.id] = 0
    adjacencyList[n.id] = []
  })

  edges.forEach(e => {
    if (adjacencyList[e.source]) {
      adjacencyList[e.source].push(e.target)
    }
    inDegree[e.target] = (inDegree[e.target] || 0) + 1
  })

  const queue: string[] = []
  Object.entries(inDegree).forEach(([id, deg]) => {
    if (deg === 0) queue.push(id)
  })

  const order: string[] = []
  while (queue.length > 0) {
    const nodeId = queue.shift()!
    order.push(nodeId)
    for (const neighbor of adjacencyList[nodeId] || []) {
      inDegree[neighbor]--
      if (inDegree[neighbor] === 0) queue.push(neighbor)
    }
  }

  return order
}

// ── Get parent node outputs ─────────────────────────────────────────────────

function getParentOutputs(nodeId: string, edges: Edge[], results: Record<string, ExecutionResult>): Record<string, string> {
  const parentOutputs: Record<string, string> = {}

  edges
    .filter(e => e.target === nodeId)
    .forEach(e => {
      const parentResult = results[e.source]
      if (parentResult?.outputUrl) {
        parentOutputs[e.source] = parentResult.outputUrl
      }
    })

  return parentOutputs
}

// ── Execute a single node ───────────────────────────────────────────────────

async function executeNode(
  node: Node<NodeData>,
  parentOutputs: Record<string, string>,
  onRetry?: (attempt: number, error: Error) => void,
): Promise<ExecutionResult> {
  const endpoint = NODE_API_MAP[node.data.type]
  if (!endpoint) {
    return { nodeId: node.id, success: false, error: `Unknown node type: ${node.data.type}`, creditsUsed: 0 }
  }

  try {
    const body = buildRequestBody(node, parentOutputs)

    const data = await withRetry(
      async () => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        const json = await response.json()

        if (!response.ok || json.error) {
          const errMsg = json.error || `HTTP ${response.status}`
          throw new Error(errMsg)
        }

        return json
      },
      {
        maxRetries: 3,
        initialDelay: 1500,
        onRetry: (attempt, error) => {
          onRetry?.(attempt, error)
        },
        shouldRetry: isRetryableError,
      },
    )

    // Extract output URL based on node type
    const outputUrl = data.imageUrl || data.videoUrl || data.audioUrl || data.script || ''

    return {
      nodeId: node.id,
      success: true,
      outputUrl,
      creditsUsed: data.creditsUsed || 0,
    }
  } catch (error: any) {
    return {
      nodeId: node.id,
      success: false,
      error: error.message || 'Execution failed',
      creditsUsed: 0,
    }
  }
}

// ── Execute entire pipeline ─────────────────────────────────────────────────

export async function executePipeline(): Promise<{
  results: ExecutionResult[]
  totalCredits: number
}> {
  const store = useWorkspaceStore.getState()
  const { nodes, edges, updateNodeStatus, updateNodeOutput, updateNodeError } = store

  const executionOrder = getExecutionOrder(nodes, edges)
  const results: Record<string, ExecutionResult> = {}
  let totalCredits = 0

  for (const nodeId of executionOrder) {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) continue

    // Set processing status
    updateNodeStatus(nodeId, 'processing')

    const parentOutputs = getParentOutputs(nodeId, edges, results)
    const result = await executeNode(node, parentOutputs)
    results[nodeId] = result
    totalCredits += result.creditsUsed

    if (result.success && result.outputUrl) {
      updateNodeOutput(nodeId, result.outputUrl)
    } else if (!result.success) {
      updateNodeError(nodeId, result.error || 'Unknown error')
    }
  }

  return {
    results: Object.values(results),
    totalCredits,
  }
}

// ── Execute single node (for manual "Execute Node" button) ──────────────────

export async function executeSingleNode(nodeId: string): Promise<ExecutionResult> {
  const store = useWorkspaceStore.getState()
  const { nodes, edges, updateNodeStatus, updateNodeOutput, updateNodeError } = store

  const node = nodes.find(n => n.id === nodeId)
  if (!node) return { nodeId, success: false, error: 'Node not found', creditsUsed: 0 }

  updateNodeStatus(nodeId, 'processing')

  // Gather parent outputs (from completed upstream nodes)
  const existingResults: Record<string, ExecutionResult> = {}
  edges.filter(e => e.target === nodeId).forEach(e => {
    const source = nodes.find(n => n.id === e.source)
    if (source?.data.outputUrl) {
      existingResults[e.source] = { nodeId: e.source, success: true, outputUrl: source.data.outputUrl, creditsUsed: 0 }
    }
  })

  const parentOutputs = getParentOutputs(nodeId, edges, existingResults)
  const result = await executeNode(node, parentOutputs)

  if (result.success && result.outputUrl) {
    updateNodeOutput(nodeId, result.outputUrl)
  } else {
    updateNodeError(nodeId, result.error || 'Execution failed')
  }

  return result
}

// ── Estimate pipeline credit cost ───────────────────────────────────────────

export function estimatePipelineCost(): number {
  const { nodes } = useWorkspaceStore.getState()
  const { CREDIT_COSTS } = require('@/lib/ai/fal-client')

  return nodes.reduce((total, node) => {
    const config = node.data.config as unknown as Record<string, unknown>
    const model = String(config.model || '')
    return total + (CREDIT_COSTS[model] || 0)
  }, 0)
}
