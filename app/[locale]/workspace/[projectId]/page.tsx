'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { ReactFlowProvider } from 'reactflow'
import { ArrowLeft, Save, Undo2, Redo2, Download, Play, Coins, Pencil, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { NodeCanvas } from '@/components/workspace/NodeCanvas'
import { NodeDetailPanel } from '@/components/workspace/NodeDetailPanel'
import { CanvasContextMenu } from '@/components/workspace/CanvasContextMenu'
import { useWorkspaceStore, DEFAULT_CONFIGS } from '@/lib/stores/workspace-store'
import { executePipeline } from '@/lib/ai/execution-engine'

function WorkspaceContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const router = useRouter()
  const projectId = params?.projectId as string | undefined
  const initRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Prevents load-effect from overwriting canvas right after we create a new project
  const justCreatedIdRef = useRef<string | null>(null)

  const { projectTitle, setProjectTitle, nodes, edges, setNodes, setEdges, undo, redo, _history, _historyFuture } = useWorkspaceStore()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(projectTitle)
  const [isSaving, setIsSaving] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

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
    setIsSaving(true)
    try {
      if (!projectId || projectId === 'new') {
        // Create new project in DB
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
    } catch {
      if (!silent) toast.error('Kayıt başarısız')
    }
    setIsSaving(false)
  }, [projectId, projectTitle, nodes, edges, router])

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => saveProject(true), 30000)
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

      {/* Main: Canvas + Properties */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <NodeCanvas />
          <CanvasContextMenu />
          <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/5">
            <p className="text-[10px] text-zinc-500">Right-click to add nodes · Drag between handles to connect</p>
          </div>
        </div>
        <NodeDetailPanel />
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
