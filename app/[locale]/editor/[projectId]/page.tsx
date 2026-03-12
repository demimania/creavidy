'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Pencil, Play, Hand, Undo2, Redo2, Coins, Loader2,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'
import { useEditorStore } from '@/lib/stores/editor-store'
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

  const {
    projectTitle, setProjectTitle, setProjectId,
    summary, updateSummary, setNarrator, setScenes, setPhase, setProgress,
    phase, scenes,
  } = useEditorStore()

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(projectTitle)
  const [credits, setCredits] = useState<{ remaining: number; total: number } | null>(null)
  const [showMusic, setShowMusic] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [mediaReplaceSceneId, setMediaReplaceSceneId] = useState<string | null>(null)
  const [sidebarIcon, setSidebarIcon] = useState<string>('chat')
  const [zoomLevel, setZoomLevel] = useState(101)

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
      updateSummary({
        script: decodedScript,
        visualStyle: searchParams.get('style') || summary.visualStyle,
        aspectRatio: searchParams.get('aspect') || summary.aspectRatio,
        duration: parseInt(searchParams.get('duration') || String(summary.duration)) || summary.duration,
      })

      const narratorId = searchParams.get('narrator')
      if (narratorId) {
        const { PRESET_NARRATORS } = require('@/lib/stores/editor-store')
        const narrator = PRESET_NARRATORS.find((n: any) => n.id === narratorId)
        if (narrator) setNarrator(narrator)
      }

      // Auto-generate scene breakdown
      generateSceneBreakdown(decodedScript)
    }
  }, [searchParams])

  // Generate scene breakdown from script
  const generateSceneBreakdown = async (script: string) => {
    setPhase('generating-script')
    setProgress({ phase: 'script', percent: 10, estimatedMinutes: 2, message: 'Analyzing script...' })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Break this script into individual scenes for a video. For each scene, provide a timestamp, duration, and the narration text. Return ONLY a JSON array like this:
[{"timestamp": "00:04", "duration": 4, "script": "scene narration text here"}]

Script:
${script.substring(0, 3000)}`
          }],
        }),
      })

      if (!response.ok) throw new Error('Generation failed')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const text = decoder.decode(value, { stream: true })
          const lines = text.split('\n').filter(l => l.startsWith('data:'))
          for (const line of lines) {
            const data = line.slice(5).trim()
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) accumulated += parsed.content
            } catch { /* skip */ }
          }

          // Update progress
          const progress = Math.min(80, 10 + (accumulated.length / 20))
          setProgress({ phase: 'script', percent: progress, estimatedMinutes: 1, message: 'Generating scenes...' })
        }
      }

      // Parse the scene breakdown
      const jsonMatch = accumulated.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          const parsedScenes = JSON.parse(jsonMatch[0])
          const narratorName = summary.narrator?.name || 'Rayo'
          const narratorId = summary.narrator?.id || 'shimmer'

          const editorScenes = parsedScenes.map((s: any, i: number) => ({
            id: `scene-${Date.now()}-${i}`,
            order: i,
            timestamp: s.timestamp || `00:${String(i * 4).padStart(2, '0')}`,
            duration: s.duration || 4,
            narratorId,
            narratorName,
            script: s.script || s.text || s.narration || '',
            status: 'idle' as const,
          }))

          setScenes(editorScenes)
          setPhase('ready')
          setProgress(null)
          toast.success(`${editorScenes.length} scenes generated`)
        } catch {
          throw new Error('Failed to parse scenes')
        }
      } else {
        // If we can't parse JSON, create simple scenes from paragraphs
        const paragraphs = script.split(/\n\n+/).filter(p => p.trim().length > 20)
        const narratorName = summary.narrator?.name || 'Rayo'
        const narratorId = summary.narrator?.id || 'shimmer'

        const editorScenes = paragraphs.slice(0, 10).map((p, i) => ({
          id: `scene-${Date.now()}-${i}`,
          order: i,
          timestamp: `00:${String(i * 4).padStart(2, '0')}`,
          duration: 4,
          narratorId,
          narratorName,
          script: p.trim().substring(0, 300),
          status: 'idle' as const,
        }))

        setScenes(editorScenes)
        setPhase('ready')
        setProgress(null)
      }
    } catch (err) {
      setPhase('idle')
      setProgress(null)
      toast.error('Scene generation failed')
    }
  }

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
        {/* Left: Logo + Title */}
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

        {/* Center: Controls */}
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

        {/* Right: Undo/Redo + Credits + Help */}
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

          {/* Credits */}
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
        {/* Left Sidebar Icons */}
        <EditorSidebar activeIcon={sidebarIcon} onIconClick={setSidebarIcon} />

        {/* 3-Panel Layout */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Panel: Video Summary */}
          <VideoSummaryPanel />

          {/* Center Panel: Film Strip */}
          <FilmStripPanel />

          {/* Right Panel: Video Preview */}
          <VideoPreviewPanel />

          {/* Music Panel (overlay) */}
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
