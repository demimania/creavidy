'use client'

import { useState, useCallback, useMemo } from 'react'
import { ChatPanel, type ScenePlan } from '@/components/chat/ChatPanel'
import type { ChatMessageData } from '@/components/chat/ChatMessage'
import type { SuggestedAction } from '@/components/chat/ChatInput'
import { useWorkspaceStore, DEFAULT_CONFIGS, type VideoBriefConfig } from '@/lib/stores/workspace-store'
import { toast } from 'sonner'
import { useReactFlow } from 'reactflow'
import { useOrchestratePipeline } from '@/lib/hooks/use-orchestrate-pipeline'

interface WorkspaceChatPanelProps {
  projectId?: string
  onDragHandlePointerDown?: (e: React.PointerEvent) => void
}

export function WorkspaceChatPanel({ projectId, onDragHandlePointerDown }: WorkspaceChatPanelProps) {
  const { addNode, nodes, edges, setEdges, updateNodeConfig, updateNodeOutput, updateNodeStatus, createBrief, setBriefStoryboard } = useWorkspaceStore()
  const [injectedMessages, setInjectedMessages] = useState<ChatMessageData[]>([])
  const reactFlowInstance = useReactFlow()

  // Find existing VideoBrief node to use as context for revisions
  const existingBrief = useMemo(() => {
    const briefNode = nodes.find(n => n.data.type === 'videoBrief')
    if (!briefNode) return null
    return { id: briefNode.id, ...(briefNode.data.config as unknown as Record<string, unknown>) }
  }, [nodes])

  // ── Orchestrate pipeline (9-step auto generation) ──
  const handlePipelineMessages = useCallback((msgs: ChatMessageData[]) => {
    setInjectedMessages(prev => [...prev, ...msgs])
  }, [])

  // In-place update for tool call messages (running → success/error)
  const [messageUpdates, setMessageUpdates] = useState<Map<string, Partial<ChatMessageData>>>(new Map())
  const handleUpdateMessage = useCallback((id: string, updates: Partial<ChatMessageData>) => {
    setMessageUpdates(prev => {
      const next = new Map(prev)
      next.set(id, updates)
      return next
    })
  }, [])

  const handleSceneUpdate = useCallback((sceneIndex: number, data: { image_url?: string; audio_url?: string }) => {
    // Find scene nodes by index and update their output
    const imageNodes = nodes.filter(n => n.data.type === 'imageGen')
    const voiceNodes = nodes.filter(n => n.data.type === 'voice')
    if (data.image_url && imageNodes[sceneIndex]) {
      updateNodeOutput(imageNodes[sceneIndex].id, data.image_url)
    }
    if (data.audio_url && voiceNodes[sceneIndex]) {
      updateNodeOutput(voiceNodes[sceneIndex].id, data.audio_url)
    }
  }, [nodes, updateNodeOutput])

  const handlePipelineComplete = useCallback((totalCredits: number) => {
    // Mark brief node as ready
    const briefNode = nodes.find(n => n.data.type === 'videoBrief')
    if (briefNode) {
      updateNodeStatus(briefNode.id, 'ready')
    }
    toast.success(`Pipeline complete! ${totalCredits} credits used`)
  }, [nodes, updateNodeStatus])

  const { state: pipelineState, run: runPipeline } = useOrchestratePipeline(
    handlePipelineMessages,
    handleUpdateMessage,
    handleSceneUpdate,
    handlePipelineComplete,
  )

  const handleGenerateNow = useCallback(() => {
    const briefNode = nodes.find(n => n.data.type === 'videoBrief')
    if (!briefNode) {
      toast.error('No Video Brief on canvas')
      return
    }
    // Mark as processing
    updateNodeStatus(briefNode.id, 'processing')
    runPipeline({
      briefConfig: briefNode.data.config as VideoBriefConfig,
      briefNodeId: briefNode.id,
    })
  }, [nodes, updateNodeStatus, runPipeline])

  // Context-aware suggested actions based on canvas state
  const suggestedActions = useMemo((): SuggestedAction[] => {
    const hasBrief = !!existingBrief
    const sceneCount = nodes.filter(n => n.data.type === 'script').length

    if (!hasBrief) {
      // No brief yet — suggest creation prompts
      return [
        { label: 'Product demo', prompt: 'Create a 30-second product demo video', icon: '📦' },
        { label: 'Explainer video', prompt: 'Create an explainer video about my product', icon: '💡' },
        { label: 'Social media reel', prompt: 'Create a 15-second Instagram reel', icon: '📱' },
        { label: 'Tutorial', prompt: 'Create a step-by-step tutorial video', icon: '🎓' },
      ]
    }

    // Brief exists — suggest revision/action prompts
    const actions: SuggestedAction[] = []
    if (!pipelineState.isRunning) {
      actions.push({ label: 'Generate now', prompt: '__GENERATE_NOW__', icon: '🚀' })
    }
    actions.push(
      { label: 'Add a scene', prompt: 'Add one more scene to the video', icon: '➕' },
      { label: 'Change style', prompt: 'Change the visual style to something more cinematic', icon: '🎨' },
      { label: 'Shorter duration', prompt: 'Make the video shorter, reduce to 15 seconds', icon: '⏱' },
    )
    if (sceneCount > 2) {
      actions.push({ label: 'Remove last scene', prompt: 'Remove the last scene from the video', icon: '✂️' })
    }
    return actions
  }, [existingBrief, nodes, pipelineState.isRunning])

  const handleScenesDetected = useCallback((plan: ScenePlan) => {
    const ts = Date.now()
    const existingBriefNode = nodes.find(n => n.data.type === 'videoBrief')

    // ── If a VideoBrief already exists, UPDATE it + replace scene nodes ──
    if (existingBriefNode) {
      const briefId = existingBriefNode.id

      // Update brief config
      updateNodeConfig(briefId, {
        prompt: plan.summary || '',
        duration: String(Math.min(plan.total_duration_seconds || 30, 300)),
      })

      // Remove old scene nodes connected to this brief
      const store = useWorkspaceStore.getState()
      const oldSceneNodeIds = store.nodes
        .filter(n => n.id !== briefId && n.id.includes('-') && (
          n.data.type === 'script' || n.data.type === 'imageGen' || n.data.type === 'voice'
        ))
        .map(n => n.id)

      // Remove old scene nodes
      oldSceneNodeIds.forEach(id => store.removeNode(id))

      // Create new scene nodes
      const sceneStartX = existingBriefNode.position.x + 400
      const freshEdges = useWorkspaceStore.getState().edges.filter(
        e => !oldSceneNodeIds.includes(e.source) && !oldSceneNodeIds.includes(e.target)
      )

      plan.scenes.forEach((scene, i) => {
        const yBase = 60 + i * 200

        const scriptId = `script-${ts}-${i}`
        addNode({
          id: scriptId, type: 'scriptNode',
          position: { x: sceneStartX, y: yBase },
          data: {
            label: `Scene ${scene.scene_order}: Script`, type: 'script', status: 'idle',
            config: { ...DEFAULT_CONFIGS.script, prompt: scene.script || scene.visual_prompt || '' } as any,
          },
        })

        const imageId = `imageGen-${ts}-${i}`
        addNode({
          id: imageId, type: 'imageGenNode',
          position: { x: sceneStartX + 280, y: yBase },
          data: {
            label: `Scene ${scene.scene_order}: Image`, type: 'imageGen', status: 'idle',
            config: { ...DEFAULT_CONFIGS.imageGen, prompt: scene.visual_prompt || '' } as any,
          },
        })

        const voiceId = `voice-${ts}-${i}`
        addNode({
          id: voiceId, type: 'voiceNode',
          position: { x: sceneStartX + 560, y: yBase },
          data: {
            label: `Scene ${scene.scene_order}: Voice`, type: 'voice', status: 'idle',
            config: { ...DEFAULT_CONFIGS.voice, text: scene.script || '' } as any,
          },
        })

        freshEdges.push(
          { id: `e-${scriptId}-${imageId}`, source: scriptId, target: imageId },
          { id: `e-${scriptId}-${voiceId}`, source: scriptId, target: voiceId },
        )
      })

      setEdges(freshEdges)

      // Inject update feedback messages
      const msgs: ChatMessageData[] = [
        {
          id: `tc-update-${ts}`, role: 'assistant', content: '',
          msg_type: 'tool_call', tool_name: 'update_storyboard',
          tool_status: 'success', tool_label: 'Update storyboard',
        },
        {
          id: `badge-${ts}`, role: 'assistant', content: '',
          msg_type: 'card_badge', card_id: briefId,
          card_title: plan.title || 'Video Brief',
          card_subtitle: `Updated · ${plan.scenes.length} scenes`,
        },
      ]
      setInjectedMessages(msgs)
      toast.success(`Brief updated — ${plan.scenes.length} scenes`)

      setTimeout(() => {
        reactFlowInstance.fitView({ nodes: [{ id: briefId }] as any, padding: 0.5, duration: 500 })
      }, 300)
      return
    }

    // ── No existing brief — CREATE new one (original flow) ──
    const maxX = nodes.length > 0
      ? Math.max(...nodes.map(n => n.position.x)) + 500
      : 100

    const briefId = `videoBrief-${ts}`
    const briefConfig = {
      ...DEFAULT_CONFIGS.videoBrief,
      prompt: plan.summary || '',
      duration: String(Math.min(plan.total_duration_seconds || 30, 300)),
    } as VideoBriefConfig
    addNode({
      id: briefId, type: 'videoBriefNode',
      position: { x: maxX, y: 100 },
      data: {
        label: plan.title || 'Video Brief', type: 'videoBrief', status: 'idle',
        config: briefConfig as any,
      },
    })

    // Register in brief store
    createBrief(briefId, briefConfig)

    const newEdges = [...edges]
    const sceneStartX = maxX + 400

    plan.scenes.forEach((scene, i) => {
      const yBase = 60 + i * 200

      const scriptId = `script-${ts}-${i}`
      addNode({
        id: scriptId, type: 'scriptNode',
        position: { x: sceneStartX, y: yBase },
        data: {
          label: `Scene ${scene.scene_order}: Script`, type: 'script', status: 'idle',
          config: { ...DEFAULT_CONFIGS.script, prompt: scene.script || scene.visual_prompt || '' } as any,
        },
      })

      const imageId = `imageGen-${ts}-${i}`
      addNode({
        id: imageId, type: 'imageGenNode',
        position: { x: sceneStartX + 280, y: yBase },
        data: {
          label: `Scene ${scene.scene_order}: Image`, type: 'imageGen', status: 'idle',
          config: { ...DEFAULT_CONFIGS.imageGen, prompt: scene.visual_prompt || '' } as any,
        },
      })

      const voiceId = `voice-${ts}-${i}`
      addNode({
        id: voiceId, type: 'voiceNode',
        position: { x: sceneStartX + 560, y: yBase },
        data: {
          label: `Scene ${scene.scene_order}: Voice`, type: 'voice', status: 'idle',
          config: { ...DEFAULT_CONFIGS.voice, text: scene.script || '' } as any,
        },
      })

      newEdges.push(
        { id: `e-${scriptId}-${imageId}`, source: scriptId, target: imageId },
        { id: `e-${scriptId}-${voiceId}`, source: scriptId, target: voiceId },
      )
    })

    setEdges(newEdges)

    const msgs: ChatMessageData[] = [
      {
        id: `tc-create-${ts}`, role: 'assistant', content: '',
        msg_type: 'tool_call', tool_name: 'create_card',
        tool_status: 'success', tool_label: 'Create card',
      },
      {
        id: `badge-${ts}`, role: 'assistant', content: '',
        msg_type: 'card_badge', card_id: briefId,
        card_title: plan.title || 'Video Brief',
        card_subtitle: `${plan.scenes.length} scenes · Click to find on canvas`,
      },
      {
        id: `tc-split-${ts}`, role: 'assistant', content: '',
        msg_type: 'tool_call', tool_name: 'split_lines_to_scenes',
        tool_status: 'success', tool_label: 'Split lines to scenes',
        tool_data: { scene_count: plan.scenes.length },
      },
    ]
    setInjectedMessages(msgs)
    toast.success(`"${plan.title}" — ${plan.scenes.length} scenes created on canvas`)

    setTimeout(() => {
      reactFlowInstance.fitView({ nodes: [{ id: briefId }] as any, padding: 0.5, duration: 500 })
    }, 300)
  }, [nodes, edges, addNode, setEdges, updateNodeConfig, reactFlowInstance, createBrief])

  // ── Handle partial brief field updates (theme, duration, etc.) ──
  const handleBriefUpdate = useCallback((updates: Record<string, unknown>) => {
    const briefNode = nodes.find(n => n.data.type === 'videoBrief')
    if (!briefNode) {
      toast.error('No Video Brief found on canvas to update')
      return
    }

    updateNodeConfig(briefNode.id, updates)

    const ts = Date.now()
    const fieldNames = Object.keys(updates).join(', ')

    const msgs: ChatMessageData[] = [
      {
        id: `tc-briefupdate-${ts}`, role: 'assistant', content: '',
        msg_type: 'tool_call', tool_name: 'update_storyboard',
        tool_status: 'success', tool_label: `Update: ${fieldNames}`,
      },
    ]
    setInjectedMessages(msgs)
    toast.success(`Brief updated: ${fieldNames}`)

    // Highlight the updated node
    const store = useWorkspaceStore.getState()
    store.highlightNode(briefNode.id)
    setTimeout(() => useWorkspaceStore.getState().highlightNode(null), 2000)
  }, [nodes, updateNodeConfig])

  const handleCardBadgeClick = useCallback((cardId: string) => {
    const node = nodes.find(n => n.id === cardId)
    if (node) {
      reactFlowInstance.fitView({ nodes: [{ id: cardId }] as any, padding: 0.5, duration: 500 })
      const store = useWorkspaceStore.getState()
      store.selectNode(cardId)
      store.highlightNode(cardId)
      setTimeout(() => useWorkspaceStore.getState().highlightNode(null), 2000)
    }
  }, [nodes, reactFlowInstance])

  const handleInjectedConsumed = useCallback(() => {
    setInjectedMessages([])
  }, [])

  return (
    <ChatPanel
      projectId={projectId}
      onScenesDetected={handleScenesDetected}
      onCardBadgeClick={handleCardBadgeClick}
      injectedMessages={injectedMessages}
      onInjectedConsumed={handleInjectedConsumed}
      briefContext={existingBrief}
      onBriefUpdate={handleBriefUpdate}
      suggestedActions={suggestedActions}
      onGenerateNow={handleGenerateNow}
      pipelineState={pipelineState}
      messageUpdates={messageUpdates}
      onDragHandlePointerDown={onDragHandlePointerDown}
    />
  )
}
