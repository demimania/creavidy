'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Pencil, Play, Hand, Undo2, Redo2, Coins,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'
import {
  useEditorStore,
  PRESET_NARRATORS,
  type EditorScene,
} from '@/lib/stores/editor-store'
import { EditorSidebar } from '@/components/editor/EditorSidebar'
import { VideoSummaryPanel } from '@/components/editor/VideoSummaryPanel'
import { FilmStripPanel } from '@/components/editor/FilmStripPanel'
import { VideoPreviewPanel } from '@/components/editor/VideoPreviewPanel'
import { EditorChatPanel } from '@/components/editor/EditorChatPanel'
import { MusicPanel } from '@/components/editor/MusicPanel'
import { MediaReplaceModal } from '@/components/editor/MediaReplaceModal'
import { ExportDialog } from '@/components/editor/ExportDialog'

function EditorContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const projectId = params?.projectId as string | undefined
  const initRef = useRef(false)

  const store = useEditorStore()
  const {
    projectTitle, setProjectTitle,
    summary, updateSummary, setNarrator, setScenes, setPhase, setProgress,
    phase, scenes, updateScene,
  } = store

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(projectTitle)
  const [credits, setCredits] = useState<{ remaining: number; total: number } | null>(null)
  const [showMusic, setShowMusic] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [mediaReplaceSceneId, setMediaReplaceSceneId] = useState<string | null>(null)
  const [sidebarIcon, setSidebarIcon] = useState<string>('chat')
  const [zoomLevel] = useState(101)

  // Load credits
  useEffect(() => {
    fetch('/api/credits').then(r => r.json()).then(d => {
      if (d.remaining !== undefined) setCredits({ remaining: d.remaining, total: d.total })
    }).catch(() => {})
  }, [])

  // Initialize from URL params (coming from /create page)
  useEffect(() => {
    if (initRef.current) return
    const script = searchParams?.get('script')
    if (script) {
      initRef.current = true
      const decodedScript = decodeURIComponent(script)
      const styleParam = searchParams.get('style') || summary.visualStyle
      const aspectParam = searchParams.get('aspect') || summary.aspectRatio
      const durationParam = parseInt(searchParams.get('duration') || String(summary.duration)) || summary.duration

      updateSummary({
        script: decodedScript,
        visualStyle: styleParam,
        aspectRatio: aspectParam,
        duration: durationParam,
      })

      const narratorId = searchParams.get('narrator')
      if (narratorId) {
        const narrator = PRESET_NARRATORS.find(n => n.id === narratorId)
        if (narrator) setNarrator(narrator)
      }

      // Auto-generate scene breakdown via /api/editor/generate
      generateSceneBreakdown(decodedScript, styleParam, durationParam)
    }
  }, [searchParams])

  // ── Step 1: Scene Breakdown ───────────────────────────────────────────────
  const generateSceneBreakdown = async (script: string, style: string, duration: number) => {
    setPhase('generating-script')
    setProgress({ phase: 'script', percent: 10, estimatedMinutes: 2, message: 'Analyzing script...' })

    try {
      const res = await fetch('/api/editor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'breakdown',
          script,
          style,
          duration,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Breakdown failed')
      }

      const data = await res.json()

      if (!data.scenes || data.scenes.length === 0) {
        throw new Error('No scenes generated')
      }

      const narratorName = summary.narrator?.name || 'Rayo'
      const narratorId = summary.narrator?.id || 'shimmer'

      // Extract characters
      if (data.characters && data.characters.length > 0) {
        updateSummary({
          characters: data.characters.map((name: string, i: number) => ({
            id: `char-${i}`,
            name,
          })),
        })
      }

      const editorScenes: EditorScene[] = data.scenes.map((s: any, i: number) => ({
        id: `scene-${Date.now()}-${i}`,
        order: i,
        timestamp: s.timestamp || `00:${String(i * 4).padStart(2, '0')}`,
        duration: s.duration || 4,
        narratorId,
        narratorName,
        script: s.script || '',
        visualPrompt: s.visual_prompt || s.script || '',
        status: 'idle' as const,
      }))

      setScenes(editorScenes)
      setPhase('ready')
      setProgress(null)
      toast.success(`${editorScenes.length} scenes generated`)

      // Calculate total duration
      const totalDur = editorScenes.reduce((acc: number, s: EditorScene) => acc + s.duration, 0)
      updateSummary({ duration: totalDur })
    } catch (err: any) {
      console.error('[editor] Scene breakdown failed:', err)
      setPhase('idle')
      setProgress(null)
      toast.error(err.message || 'Scene generation failed')

      // Fallback: split script into paragraphs
      const paragraphs = script.split(/[.!?]\s+/).filter(p => p.trim().length > 15)
      const narratorName = summary.narrator?.name || 'Rayo'
      const narratorId = summary.narrator?.id || 'shimmer'

      if (paragraphs.length > 0) {
        const fallbackScenes: EditorScene[] = paragraphs.slice(0, 8).map((p, i) => ({
          id: `scene-${Date.now()}-${i}`,
          order: i,
          timestamp: `00:${String(i * 4).padStart(2, '0')}`,
          duration: 4,
          narratorId,
          narratorName,
          script: p.trim().substring(0, 200),
          status: 'idle' as const,
        }))
        setScenes(fallbackScenes)
        setPhase('ready')
        toast.info(`Created ${fallbackScenes.length} scenes from script paragraphs`)
      }
    }
  }

  // ── Step 2: Generate Media for All Scenes (fal.ai images + TTS) ───────────
  const generateMediaForScenes = useCallback(async () => {
    if (scenes.length === 0) {
      toast.error('No scenes to generate media for')
      return
    }

    setPhase('generating-media')
    setProgress({ phase: 'media', percent: 0, estimatedMinutes: Math.ceil(scenes.length * 0.5), message: 'Starting media generation...' })

    // Mark all scenes as generating
    scenes.forEach(s => updateScene(s.id, { status: 'generating' }))

    try {
      const res = await fetch('/api/editor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-media',
          scenes: scenes.map(s => ({
            id: s.id,
            script: s.script,
            order: s.order,
          })),
          style: summary.visualStyle,
          aspectRatio: summary.aspectRatio,
          voiceId: summary.narrator?.voiceId || 'shimmer',
          engine: 'openai-tts',
        }),
      })

      if (!res.ok) throw new Error('Media generation failed')

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response body')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n').filter(l => l.startsWith('data:'))

        for (const line of lines) {
          const dataStr = line.slice(5).trim()
          if (dataStr === '[DONE]') break

          try {
            const data = JSON.parse(dataStr)

            if (data.type === 'progress') {
              setProgress({
                phase: 'media',
                percent: data.percent,
                estimatedMinutes: Math.max(1, Math.ceil((100 - data.percent) / 30)),
                message: data.message,
              })
            }

            if (data.type === 'scene-image') {
              updateScene(data.sceneId, { imageUrl: data.imageUrl, status: 'ready' })
            }

            if (data.type === 'scene-audio') {
              updateScene(data.sceneId, { audioUrl: data.audioUrl })
            }

            if (data.type === 'complete') {
              setPhase('ready')
              setProgress(null)
              const successCount = data.results?.filter((r: any) => r.imageUrl)?.length || 0
              toast.success(`${successCount}/${scenes.length} scenes generated`)
            }
          } catch { /* skip malformed SSE */ }
        }
      }
    } catch (err: any) {
      console.error('[editor] Media generation failed:', err)
      setPhase('ready')
      setProgress(null)
      scenes.forEach(s => {
        if (s.status === 'generating') updateScene(s.id, { status: 'idle' })
      })
      toast.error(err.message || 'Media generation failed')
    }
  }, [scenes, summary, setPhase, setProgress, updateScene])

  // ── Single scene image regeneration ───────────────────────────────────────
  const regenerateSceneImage = useCallback(async (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId)
    if (!scene) return

    updateScene(sceneId, { status: 'generating' })

    try {
      const res = await fetch('/api/editor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-scene-image',
          sceneId,
          visualPrompt: (scene as any).visualPrompt || scene.script,
          style: summary.visualStyle,
          aspectRatio: summary.aspectRatio,
        }),
      })

      if (!res.ok) throw new Error('Image generation failed')
      const data = await res.json()
      updateScene(sceneId, { imageUrl: data.imageUrl, status: 'ready' })
      toast.success('Scene image regenerated')
    } catch (err: any) {
      updateScene(sceneId, { status: 'failed' })
      toast.error(err.message || 'Image regeneration failed')
    }
  }, [scenes, summary, updateScene])

  // Expose functions to child components via store
  useEffect(() => {
    // Store the functions in window for child component access
    (window as any).__editorActions = {
      generateMediaForScenes,
      regenerateSceneImage,
      setMediaReplaceSceneId,
      setShowMusic,
      setShowExport,
    }
  }, [generateMediaForScenes, regenerateSceneImage])

  const handleTitleSubmit = () => {
    const newTitle = titleDraft.trim()
    if (!newTitle) { setTitleDraft(projectTitle); setIsEditingTitle(false); return }
    setProjectTitle(newTitle)
    setIsEditingTitle(false)
  }

  const remainingCredits = credits?.remaining ?? '...'

  return (
    <div className="flex flex-col h-screen w-full bg-[#0F051D] text-white overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between h-11 px-3 border-b border-white/10 bg-black/30 backdrop-blur-xl flex-shrink-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          {isEditingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSubmit(); if (e.key === 'Escape') { setTitleDraft(projectTitle); setIsEditingTitle(false) } }}
              className="text-sm font-semibold text-white bg-white/5 border border-white/15 rounded-lg px-2 py-0.5 outline-none focus:border-[#0ea5e9]/40 max-w-[200px]"
            />
          ) : (
            <button
              onClick={() => { setTitleDraft(projectTitle); setIsEditingTitle(true) }}
              className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-[#0ea5e9] transition-colors group"
            >
              <span className="truncate max-w-[200px]">{projectTitle}</span>
              <Pencil className="w-3 h-3 text-zinc-600 group-hover:text-[#0ea5e9] transition-colors" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Play">
            <Play className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Pan">
            <Hand className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 text-[11px] text-zinc-400">
            {zoomLevel}%
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Undo">
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Redo">
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Help">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 ml-1">
            <Coins className="w-3 h-3 text-[#0ea5e9]" />
            <span className="text-[10px] font-semibold text-[#0ea5e9]">
              {typeof remainingCredits === 'number' ? remainingCredits.toLocaleString() : remainingCredits}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar activeIcon={sidebarIcon} onIconClick={setSidebarIcon} />
        <div className="flex flex-1 overflow-hidden relative">
          <VideoSummaryPanel />
          <FilmStripPanel />
          <VideoPreviewPanel />
          <AnimatePresence>
            {showMusic && <MusicPanel onClose={() => setShowMusic(false)} />}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom: AI Chat Panel */}
      <EditorChatPanel />

      {/* Modals */}
      <AnimatePresence>
        {mediaReplaceSceneId && (
          <MediaReplaceModal
            sceneId={mediaReplaceSceneId}
            onClose={() => setMediaReplaceSceneId(null)}
          />
        )}
        {showExport && (
          <ExportDialog
            onClose={() => setShowExport(false)}
            onExport={(settings) => {
              toast.success(`Exporting as ${settings.format} (${settings.resolution})`)
              setShowExport(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-[#0F051D]">
          <div className="w-8 h-8 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  )
}
