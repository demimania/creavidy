'use client'
import { useState, useCallback } from 'react'
import { Handle, Position } from 'reactflow'
import { Play, Loader2, RefreshCw, ListOrdered, CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { NodeData } from '@/lib/stores/workspace-store'

// ─── Text Iterator Node ───────────────────────────────────────────────────────
// Kullanıcı textarea'ya liste girer (her satır bir item)
// Output: array of text
export function TextIteratorNodeContent({ data }: { data: NodeData; selected?: boolean }) {
  const [items, setItems] = useState<string>((data.config as any)?.items || '')
  const [outputIndex] = useState(0)

  const lines = items.split('\n').filter(l => l.trim())

  return (
    <div className="bg-[#0F051D]/95 border border-white/10 rounded-xl p-3 min-w-[200px] max-w-[240px]">
      <Handle type="target" position={Position.Left} id="trigger" style={{ background: '#a78bfa' }} />
      <Handle type="source" position={Position.Right} id="text-out" style={{ background: '#a78bfa', top: '40%' }} />
      <Handle type="source" position={Position.Right} id="index-out" style={{ background: '#6b7280', top: '60%' }} />

      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6 h-6 rounded-lg bg-[#a78bfa]/15 flex items-center justify-center">
          <ListOrdered className="w-3 h-3 text-[#a78bfa]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-zinc-200">Text Iterator</p>
          <p className="text-[9px] text-zinc-500">{lines.length} item{lines.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <textarea
        value={items}
        onChange={e => setItems(e.target.value)}
        placeholder={'item 1\nitem 2\nitem 3'}
        rows={4}
        className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-2 py-1.5 text-[10px] text-zinc-300 outline-none focus:border-[#a78bfa]/40 resize-none font-mono"
      />

      {lines.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#a78bfa] rounded-full transition-all"
              style={{ width: `${((outputIndex + 1) / lines.length) * 100}%` }}
            />
          </div>
          <span className="text-[9px] text-zinc-500 font-mono">{outputIndex + 1}/{lines.length}</span>
        </div>
      )}
    </div>
  )
}

// ─── Image Iterator Node ──────────────────────────────────────────────────────
// Prompt listesi → her prompt için fal.ai Flux Schnell çağırır
// Sonuçları grid olarak gösterir
export function ImageIteratorNodeContent({ data }: { data: NodeData; selected?: boolean }) {
  const [prompts, setPrompts] = useState<string>((data.config as any)?.prompts || '')
  type ImageResult = { prompt: string; url?: string; status: 'pending' | 'running' | 'done' | 'error'; error?: string }
  const [results, setResults] = useState<ImageResult[]>([])
  const [running, setRunning] = useState(false)
  const [model] = useState((data.config as any)?.model || 'fal-ai/flux/schnell')

  const lines = prompts.split('\n').filter(l => l.trim())

  const handleRun = useCallback(async () => {
    if (lines.length === 0) return
    setRunning(true)

    // Initialize results
    const initial: ImageResult[] = lines.map(p => ({ prompt: p, status: 'pending' }))
    setResults(initial)

    // Process sequentially (to avoid rate limits)
    const updated: ImageResult[] = [...initial]
    for (let i = 0; i < lines.length; i++) {
      updated[i] = { ...updated[i], status: 'running' }
      setResults([...updated])

      try {
        const res = await fetch('/api/generate/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: lines[i], model, aspectRatio: '1:1' }),
        })
        const d = await res.json()
        if (d.error) throw new Error(d.error)
        updated[i] = { ...updated[i], status: 'done', url: d.imageUrl }
      } catch (e: any) {
        updated[i] = { ...updated[i], status: 'error', error: e.message }
      }
      setResults([...updated])
    }
    setRunning(false)
  }, [lines, model])

  return (
    <div className="bg-[#0F051D]/95 border border-white/10 rounded-xl p-3 min-w-[220px] max-w-[280px]">
      <Handle type="target" position={Position.Left} id="prompts-in" style={{ background: '#a78bfa' }} />
      <Handle type="source" position={Position.Right} id="images-out" style={{ background: '#FFE744' }} />

      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6 h-6 rounded-lg bg-[#FFE744]/15 flex items-center justify-center">
          <RefreshCw className="w-3 h-3 text-[#FFE744]" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-zinc-200">Image Iterator</p>
          <p className="text-[9px] text-zinc-500">{lines.length} prompt</p>
        </div>
        <button
          onClick={handleRun}
          disabled={running || lines.length === 0}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FFE744]/10 border border-[#FFE744]/20 text-[#FFE744] text-[9px] font-semibold hover:bg-[#FFE744]/20 transition-colors disabled:opacity-40"
        >
          {running ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Play className="w-2.5 h-2.5" />}
          {running ? 'Running' : 'Run All'}
        </button>
      </div>

      <textarea
        value={prompts}
        onChange={e => setPrompts(e.target.value)}
        placeholder={'a red car\na blue sky\na mountain'}
        rows={3}
        className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-2 py-1.5 text-[10px] text-zinc-300 outline-none focus:border-[#FFE744]/30 resize-none font-mono mb-2"
      />

      {/* Results grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-1">
          {results.map((r, i) => (
            <div key={i} className="aspect-square rounded-md overflow-hidden bg-white/5 flex items-center justify-center relative">
              {r.status === 'pending' && <Clock className="w-3 h-3 text-zinc-600" />}
              {r.status === 'running' && <Loader2 className="w-3 h-3 text-[#FFE744] animate-spin" />}
              {r.status === 'error' && <XCircle className="w-3 h-3 text-red-400" />}
              {r.status === 'done' && r.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.url} alt={r.prompt} className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Task Manager Node ────────────────────────────────────────────────────────
// Canvas'taki tüm node'ların execution durumunu gösterir
// Her node için: status badge, re-run butonu
export function TaskManagerNodeContent({ data }: { data: NodeData; selected?: boolean }) {
  const tasks = (data.config as any)?.tasks as Array<{
    id: string; label: string; status: 'idle' | 'running' | 'done' | 'error'; credits?: number
  }> || []

  const statusIcon = (status: string) => {
    if (status === 'running') return <Loader2 className="w-2.5 h-2.5 text-[#a78bfa] animate-spin" />
    if (status === 'done') return <CheckCircle2 className="w-2.5 h-2.5 text-[#06d6a0]" />
    if (status === 'error') return <XCircle className="w-2.5 h-2.5 text-red-400" />
    return <Clock className="w-2.5 h-2.5 text-zinc-600" />
  }

  return (
    <div className="bg-[#0F051D]/95 border border-white/10 rounded-xl p-3 min-w-[200px] max-w-[240px]">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6 h-6 rounded-lg bg-[#D1FE17]/10 flex items-center justify-center">
          <CheckCircle2 className="w-3 h-3 text-[#D1FE17]" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-zinc-200">Task Manager</p>
          <p className="text-[9px] text-zinc-500">{tasks.filter(t => t.status === 'done').length}/{tasks.length} done</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="text-[9px] text-zinc-600 text-center py-3">Pipeline&apos;ı çalıştırınca görevler burada görünür</p>
      ) : (
        <div className="space-y-1">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/[0.03]">
              {statusIcon(task.status)}
              <span className="flex-1 text-[9px] text-zinc-400 truncate">{task.label}</span>
              {task.credits && <span className="text-[8px] text-[#D1FE17]/50 font-mono">{task.credits}cr</span>}
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D1FE17] rounded-full transition-all duration-500"
            style={{ width: `${(tasks.filter(t => t.status === 'done').length / tasks.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
