'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { ReactFlowProvider } from 'reactflow'
import { ArrowLeft, Download, Coins, Pencil, Loader2, MessageSquare, Settings2, PanelRightClose, X, Minus, Cloud, Check, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { NodeCanvas } from '@/components/workspace/NodeCanvas'
import { FloatingNodeToolbar } from '@/components/workspace/FloatingNodeToolbar'
import { NodeDetailPanel } from '@/components/workspace/NodeDetailPanel'
import { CanvasContextMenu } from '@/components/workspace/CanvasContextMenu'
import { WorkspaceChatPanel } from '@/components/workspace/WorkspaceChatPanel'
import { useWorkspaceStore, DEFAULT_CONFIGS } from '@/lib/stores/workspace-store'
import { executePipeline } from '@/lib/ai/execution-engine'
import { getNodeDef } from '@/lib/constants/node-definitions'

function WorkspaceContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const projectId = params?.projectId as string | undefined
  const initRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Prevents load-effect from overwriting canvas right after we create a new project
  const justCreatedIdRef = useRef<string | null>(null)

  const { projectTitle, setProjectTitle, nodes, edges, setNodes, setEdges, undo, redo, _history, _historyFuture, selectedNodeId } = useWorkspaceStore()

  // When a node is selected, open properties panel
  const prevSelectedRef = useRef<string | null>(null)
  useEffect(() => {
    if (selectedNodeId && selectedNodeId !== prevSelectedRef.current) {
      setPropertiesOpen(true)
    }
    prevSelectedRef.current = selectedNodeId
  }, [selectedNodeId])
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(projectTitle)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle')
  const [isRunning, setIsRunning] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Properties panel (right side)
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  // Floating chat window
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMinimized, setChatMinimized] = useState(false)

  // Gerçek kredi bakiyesi
  const [credits, setCredits] = useState<{ remaining: number; total: number } | null>(null)
  const refreshCredits = useCallback(() => {
    fetch('/api/credits').then(r => r.json()).then(d => {
      if (d.remaining !== undefined) setCredits({ remaining: d.remaining, total: d.total })
    }).catch(() => {})
  }, [])
  useEffect(() => { refreshCredits() }, [refreshCredits])

  // Workspace başlatma (Create page'den gelince)
  useEffect(() => {
    if (initRef.current) return
    const prompt = searchParams?.get('prompt')
    const mode = searchParams?.get('mode')

    if (mode === 'video' && prompt) {
      initRef.current = true
      const narratorParam = searchParams.get('narrator')
      const durationParam = searchParams.get('duration')
      const aspectParam = searchParams.get('aspect')
      setNodes([{
        id: `videoBrief-${Date.now()}`,
        type: 'videoBriefNode',
        position: { x: 100, y: 100 },
        data: {
          label: 'Video Brief 1',
          type: 'videoBrief',
          status: 'idle',
          config: {
            ...(DEFAULT_CONFIGS.videoBrief as any),
            prompt: decodeURIComponent(prompt),
            visualStyle: searchParams.get('style') || 'Cartoon 3D',
            narrator: narratorParam || (DEFAULT_CONFIGS.videoBrief as any).narrator,
            duration: durationParam || (DEFAULT_CONFIGS.videoBrief as any).duration,
            aspect: aspectParam || (DEFAULT_CONFIGS.videoBrief as any).aspect,
            autoGenerate: true,
          }
        },
        selected: true
      }])
      setEdges([])
    }
  }, [searchParams])

  // Proje yükle (var olan projectId ile gelince)
  useEffect(() => {
    if (!projectId || projectId === 'new') return
    // Skip loading if we just created this project (canvas already has correct state)
    if (justCreatedIdRef.current === projectId) { justCreatedIdRef.current = null; return }
    fetch(`/api/projects/${projectId}`)
      .then(r => r.json())
      .then(data => {
        const project = data.project || data
        if (project.title) setProjectTitle(project.title)
        if (project.workflow_data?.nodes) setNodes(project.workflow_data.nodes)
        if (project.workflow_data?.edges) setEdges(project.workflow_data.edges)
      })
      .catch(() => {})
  }, [projectId])

  // Save — creates project if new, patches if existing
  const saveProject = useCallback(async (silent = false) => {
    setSaveStatus('saving')
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    try {
      if (!projectId || projectId === 'new') {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: projectTitle, workflow_data: { nodes, edges } }),
        })
        const data = await res.json()
        const newId = data.project?.id
        if (newId) {
          justCreatedIdRef.current = newId
          router.replace(`/workspace/${newId}`)
          if (!silent) toast.success('Proje oluşturuldu')
        }
      } else {
        await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: projectTitle, workflow_data: { nodes, edges } }),
        })
        if (!silent) toast.success('Kaydedildi')
      }
      setSaveStatus('saved')
      savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('unsaved')
      if (!silent) toast.error('Kayıt başarısız')
    }
  }, [projectId, projectTitle, nodes, edges, router])

  // Auto-save: 5s debounce after any canvas change
  const autoSaveSkipRef = useRef(true) // skip first render
  useEffect(() => {
    if (autoSaveSkipRef.current) { autoSaveSkipRef.current = false; return }
    setSaveStatus('unsaved')
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => saveProject(true), 5000)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [nodes, edges, saveProject])

  const handleTitleSubmit = async () => {
    const newTitle = titleDraft.trim()
    if (!newTitle) { setTitleDraft(projectTitle); setIsEditingTitle(false); return }
    setProjectTitle(newTitle)
    setIsEditingTitle(false)
    // Save immediately (also handles new projects by creating them)
    try {
      if (!projectId || projectId === 'new') {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle, workflow_data: { nodes, edges } }),
        })
        const data = await res.json()
        const newId = data.project?.id
        if (newId) { justCreatedIdRef.current = newId; router.replace(`/workspace/${newId}`) }
      } else {
        await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle }),
        })
      }
    } catch { /* silent */ }
  }

  const handleRunPipeline = async () => {
    if (nodes.length === 0) { toast.error('Canvas boş — önce node ekleyin'); return }
    setIsRunning(true)
    try {
      const result = await executePipeline()
      const succeeded = result.results.filter(r => r.success).length
      const failed = result.results.filter(r => !r.success).length
      if (failed === 0) {
        toast.success(`Pipeline tamamlandı! ${succeeded} node çalıştı · ${result.totalCredits} kredi`)
      } else {
        toast.warning(`${succeeded} başarılı, ${failed} başarısız · ${result.totalCredits} kredi`)
      }
      refreshCredits()
    } catch (e: any) {
      toast.error(e.message || 'Pipeline başarısız')
    } finally {
      setIsRunning(false)
    }
  }

  const remainingCredits = credits?.remaining ?? '...'
  const totalCredits = credits?.total ?? '...'

  return (
    <div className="flex flex-col h-screen w-full bg-[#0F051D] text-white overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-white/10 bg-black/30 backdrop-blur-xl flex-shrink-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors" title="Ana Sayfa">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link href="/dashboard" className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5" title="Dashboard">
            <LayoutDashboard className="w-3.5 h-3.5" />
          </Link>

          {isEditingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSubmit(); if (e.key === 'Escape') { setTitleDraft(projectTitle); setIsEditingTitle(false) } }}
              className="text-sm font-semibold text-white bg-white/5 border border-white/15 rounded-lg px-2 py-1 outline-none focus:border-[#D1FE17]/40 max-w-[200px]"
            />
          ) : (
            <button
              onClick={() => { setTitleDraft(projectTitle); setIsEditingTitle(true) }}
              className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-[#D1FE17] transition-colors group"
            >
              <span className="truncate max-w-[200px]">{projectTitle}</span>
              <Pencil className="w-3 h-3 text-zinc-600 group-hover:text-[#D1FE17] transition-colors" />
            </button>
          )}

          {/* Save status indicator */}
          <div className="flex items-center gap-1 ml-2">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-[10px] text-[#06d6a0]">
                <Check className="w-3 h-3" />
                Saved
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="flex items-center gap-1 text-[10px] text-[#D1FE17]/60">
                <Cloud className="w-3 h-3" />
                Unsaved
              </span>
            )}
          </div>
        </div>

        {/* Center — Kredi Bakiyesi */}
        <div className="flex items-center gap-3">
          {isRunning && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[11px] text-[#a78bfa]">
              <Loader2 className="w-3 h-3 animate-spin" />
              Pipeline çalışıyor...
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#D1FE17]/5 border border-[#D1FE17]/15">
            <Coins className="w-3.5 h-3.5 text-[#D1FE17]" />
            <span className="text-[11px] font-semibold text-[#D1FE17]">{typeof remainingCredits === 'number' ? remainingCredits.toLocaleString() : remainingCredits}</span>
            <span className="text-[10px] text-zinc-500">/ {typeof totalCredits === 'number' ? totalCredits.toLocaleString() : totalCredits} credits</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D1FE17]/15 border border-[#D1FE17]/30 text-[11px] text-[#D1FE17] font-medium hover:bg-[#D1FE17]/25 transition-all" title="Export">
            <Download className="w-3 h-3" /> Export
          </button>
        </div>
      </div>

      {/* Main: Canvas + Properties Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas wrapper */}
        <div className="flex-1 relative">
          <NodeCanvas />
          <FloatingNodeToolbar />
          <CanvasContextMenu />
          <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/5">
            <p className="text-[10px] text-zinc-500">Sağ-tık: node ekle · Shift+click: çoklu seçim · Del: sil · ⌘D: kopyala</p>
          </div>

          {/* Floating Chat Toggle Button — bottom-left above hint */}
          {!chatOpen && (
            <button
              onClick={() => { setChatOpen(true); setChatMinimized(false) }}
              className="absolute bottom-14 left-4 z-30 flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#06d6a0] text-white text-[11px] font-semibold shadow-lg shadow-[#a78bfa]/30 hover:opacity-90 hover:scale-105 transition-all"
              title="Open AI Chat"
            >
              <MessageSquare className="w-4 h-4" />
              AI Chat
            </button>
          )}

          {/* Floating Chat Window */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={chatMinimized
                  ? { opacity: 1, y: 0, scale: 1, height: 48 }
                  : { opacity: 1, y: 0, scale: 1, height: 520 }
                }
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-14 left-4 z-30 w-[380px] rounded-2xl border border-white/10 bg-[#0F051D]/95 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col"
                style={{ maxHeight: 'calc(100% - 80px)' }}
              >
                {/* Chat Window Header */}
                <div className="flex items-center h-12 px-3 border-b border-white/10 flex-shrink-0 cursor-pointer"
                  onClick={() => chatMinimized && setChatMinimized(false)}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#a78bfa] to-[#06d6a0] flex items-center justify-center mr-2">
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white flex-1">AI Video Director</span>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setChatMinimized(!chatMinimized) }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                      title={chatMinimized ? 'Expand' : 'Minimize'}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setChatOpen(false); setChatMinimized(false) }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                      title="Close Chat"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Chat Content — hidden when minimized */}
                {!chatMinimized && (
                  <div className="flex-1 overflow-hidden">
                    <WorkspaceChatPanel projectId={projectId} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel: Properties Only */}
        {propertiesOpen && (
          <div className="flex flex-col w-72 border-l border-white/10 bg-black/20 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center h-10 px-3 border-b border-white/10 flex-shrink-0">
              <Settings2 className="w-3.5 h-3.5 text-zinc-400 mr-1.5" />
              <span className="text-[11px] font-medium text-white flex-1">Properties</span>
              <button
                onClick={() => setPropertiesOpen(false)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                title="Close Properties"
              >
                <PanelRightClose className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <NodeDetailPanel />
            </div>
          </div>
        )}

        {/* Properties toggle — always visible when panel closed */}
        {!propertiesOpen && (
          <div className="flex flex-col items-center py-3 px-1.5 border-l border-white/10 bg-black/20">
            <button
              onClick={() => setPropertiesOpen(true)}
              className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition-all relative"
              title="Open Properties"
            >
              <Settings2 className="w-3.5 h-3.5" />
              {selectedNodeId && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#D1FE17] rounded-full" />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-[#0F051D]">
          <div className="w-8 h-8 border-2 border-[#a78bfa] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReactFlowProvider>
        <WorkspaceContent />
      </ReactFlowProvider>
    </Suspense>
  )
}
