"use client";

import { Suspense, useState, useCallback } from "react";
import { ArrowLeft, Film, Settings2, Layers, Download, Sparkles, Clock, Cpu, Play, ChevronRight, Wand2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatPanel, type ScenePlan, type Scene } from "@/components/chat/ChatPanel";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "@/components/ui/particles";
import { useProjectStore } from "@/lib/stores/project-store";
import { useWorkspaceStore, NODE_COLORS } from "@/lib/stores/workspace-store";
import type { Node, Edge } from "reactflow";
import type { NodeData, ScriptConfig, ImageGenConfig, VideoGenConfig, VoiceConfig } from "@/lib/stores/workspace-store";

// ── ScenePlan → Workspace nodes ─────────────────────────────────────────────

function scenePlanToNodes(plan: ScenePlan): { nodes: Node<NodeData>[], edges: Edge[] } {
  const nodes: Node<NodeData>[] = []
  const edges: Edge[] = []
  const SCENE_W = 420

  plan.scenes.forEach((scene: Scene, i: number) => {
    const x = i * SCENE_W
    const ts = Date.now() + i
    const scriptId = `script-${ts}`
    const imageId  = `image-${ts}`
    const voiceId  = `voice-${ts}`
    const videoId  = `video-${ts}`

    nodes.push({
      id: scriptId, type: 'scriptNode', position: { x, y: 60 },
      data: { label: scene.title || `Scene ${i+1}`, type: 'script', status: 'idle',
        config: { model: 'gpt-4o', language: 'English', sceneCount: 1, prompt: scene.script } as ScriptConfig },
    })
    nodes.push({
      id: imageId, type: 'imageGenNode', position: { x, y: 280 },
      data: { label: `Image ${i+1}`, type: 'imageGen', status: 'idle',
        config: { model: 'flux-schnell', resolution: '1024x1024', style: 'cinematic', prompt: scene.visual_prompt } as ImageGenConfig },
    })
    nodes.push({
      id: voiceId, type: 'voiceNode', position: { x, y: 500 },
      data: { label: `Voice ${i+1}`, type: 'voice', status: 'idle',
        config: { source: 'preset', voiceId: 'alloy', voiceName: 'Alloy', speed: 1, language: 'English', engine: 'openai-tts', text: scene.script } as VoiceConfig },
    })
    nodes.push({
      id: videoId, type: 'videoGenNode', position: { x, y: 720 },
      data: { label: `Video ${i+1}`, type: 'videoGen', status: 'idle',
        config: { model: 'kling-3.0-standard-t2v', resolution: '1080p', duration: Math.min(scene.duration_seconds || 5, 15) as 5|10|15, fps: 24, prompt: scene.visual_prompt } as VideoGenConfig },
    })
    edges.push(
      { id: `e-si-${i}`, source: scriptId, target: imageId, type: 'labeled', animated: true, style: { stroke: NODE_COLORS.script, strokeWidth: 2 }, data: { label: 'Prompt' } },
      { id: `e-sv-${i}`, source: scriptId, target: voiceId, type: 'labeled', animated: true, style: { stroke: NODE_COLORS.script, strokeWidth: 2 }, data: { label: 'Script' } },
      { id: `e-iv-${i}`, source: imageId,  target: videoId, type: 'labeled', animated: true, style: { stroke: NODE_COLORS.imageGen, strokeWidth: 2 }, data: { label: 'Image' } },
      { id: `e-vv-${i}`, source: voiceId,  target: videoId, type: 'labeled', animated: true, style: { stroke: NODE_COLORS.voice, strokeWidth: 2 }, data: { label: 'Audio' } },
    )
  })
  return { nodes, edges }
}

// ────────────────────────────────────────────────────────────────────────────

const MODEL_COLORS: Record<string, string> = {
  flux: '#D1FE17',
  midjourney: '#a78bfa',
  kling: '#06d6a0',
  runway: '#FF6B6B',
  pika: '#FF9F1C',
}

function SceneCard({ scene, index }: { scene: Scene; index: number }) {
  const color = MODEL_COLORS[scene.recommended_model?.toLowerCase()] || '#a78bfa'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">
            {scene.scene_order}
          </span>
          <p className="text-xs font-semibold text-white truncate">{scene.title}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="flex items-center gap-1 text-[10px] text-zinc-500">
            <Clock className="w-3 h-3" />{scene.duration_seconds}s
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: `${color}15`, color }}>
            {scene.recommended_model}
          </span>
        </div>
      </div>
      {scene.script && (
        <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 mb-2">{scene.script}</p>
      )}
      {scene.visual_prompt && (
        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-white/3 border border-white/6">
          <Cpu className="w-3 h-3 text-zinc-600 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">{scene.visual_prompt}</p>
        </div>
      )}
      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-[#a78bfa]">
        <Play className="w-3 h-3" />
        <span>Scene #{scene.scene_order} · {scene.duration_seconds}s</span>
        <ChevronRight className="w-3 h-3 ml-auto" />
      </div>
    </motion.div>
  )
}

function SceneCanvas({ plan, onBuild }: { plan: ScenePlan | null; onBuild: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-xl flex-shrink-0">
        <Film className="w-4 h-4 text-[#a78bfa]" />
        <p className="text-sm font-semibold text-white">Scene Canvas</p>
        {plan && (
          <span className="text-[11px] text-zinc-500 truncate max-w-[120px]">{plan.title}</span>
        )}
        <span className="ml-auto text-[11px] text-zinc-500">
          {plan?.scenes.length ?? 0} {(plan?.scenes.length ?? 0) === 1 ? "scene" : "scenes"}
        </span>
        {plan && (
          <button
            onClick={onBuild}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#D1FE17]/15 border border-[#D1FE17]/25 text-[11px] text-[#D1FE17] font-semibold hover:bg-[#D1FE17]/25 transition-all"
          >
            <Wand2 className="w-3 h-3" />
            Workspace'te Aç
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {!plan ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center justify-center h-full text-center py-20"
            >
              <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5">
                <Layers className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Scenes Yet</h3>
              <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-6">
                Describe your video idea in the chat. The AI Director will generate a scene-by-scene plan here.
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask the AI to create a video plan to get started</span>
              </div>
            </motion.div>
          ) : (
            <motion.div key="scenes" className="space-y-3">
              {plan.summary && (
                <div className="px-3 py-2 rounded-xl bg-[#a78bfa]/8 border border-[#a78bfa]/15 text-[11px] text-[#a78bfa] mb-4">
                  {plan.summary}
                </div>
              )}
              {plan.scenes.map((scene, i) => (
                <SceneCard key={scene.scene_order} scene={scene} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ChatPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project") || undefined;
  const initialPrompt = searchParams.get("prompt") || undefined;
  const [scenePlan, setScenePlan] = useState<ScenePlan | null>(null)

  const { prompt: storePrompt, style, duration, aspectRatio } = useProjectStore();
  const { setNodes, setEdges, setProjectTitle } = useWorkspaceStore()
  const resolvedPrompt = initialPrompt || storePrompt || undefined;

  const handleBuildInWorkspace = useCallback(() => {
    if (!scenePlan) return
    const { nodes, edges } = scenePlanToNodes(scenePlan)
    setNodes(nodes)
    setEdges(edges)
    setProjectTitle(scenePlan.title || 'AI Director Project')
    router.push('/workspace/new')
  }, [scenePlan, setNodes, setEdges, setProjectTitle, router])

  return (
    <div className="relative flex flex-col h-screen w-full bg-[#0F051D] text-white font-sans overflow-hidden">
      <Particles className="absolute inset-0 z-0 opacity-10" quantity={20} ease={80} color="#a78bfa" refresh />

      <div className="relative z-50 w-full border-b border-white/5 bg-[#0F051D]/80 backdrop-blur-md flex-shrink-0">
        <div className="flex h-12 items-center justify-between px-4 gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <span className="text-xs text-zinc-500 truncate max-w-[200px]">
            {resolvedPrompt ? `"${resolvedPrompt.slice(0, 50)}${resolvedPrompt.length > 50 ? "…" : ""}"` : "New Project"}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
            <Sparkles className="w-3 h-3" />
            Creavidy · AI Director
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <div className="w-full md:w-[42%] lg:w-[38%] flex-shrink-0 border-r border-white/10 flex flex-col overflow-hidden">
          <ChatPanel
            projectId={projectId}
            initialPrompt={resolvedPrompt}
            style={style}
            durationSeconds={duration}
            aspectRatio={aspectRatio}
            onScenesDetected={setScenePlan}
          />
        </div>
        <div className="hidden md:flex flex-1 flex-col overflow-hidden">
          <SceneCanvas plan={scenePlan} onBuild={handleBuildInWorkspace} />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-[#0F051D]">
          <div className="w-8 h-8 border-2 border-[#a78bfa] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
