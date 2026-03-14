'use client'

import { useState, useMemo, useCallback } from 'react'
import { Search, ChevronDown, ChevronRight, Zap, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  NODE_DEFINITIONS,
  CATEGORY_META,
  type NodeCategory,
  type NodeDefinition,
  searchNodes,
  getNodesByCategory,
} from '@/lib/constants/node-definitions'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import type { Node } from 'reactflow'
import type { NodeData } from '@/lib/stores/workspace-store'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean
  onClose: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active: { label: '',       cls: '' },
  beta:   { label: 'BETA',  cls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  soon:   { label: 'SOON',  cls: 'bg-zinc-700/60 text-zinc-400 border border-zinc-600/30' },
}

// Credits display
function CreditBadge({ cost }: { cost?: number | string }) {
  if (!cost) return null
  return (
    <span className="text-[10px] text-[#D1FE17] font-mono opacity-70">
      {typeof cost === 'number' ? `${cost}cr` : cost}
    </span>
  )
}

// Single node card (draggable)
function NodeCard({ node, onAdd }: { node: NodeDefinition; onAdd: (node: NodeDefinition) => void }) {
  const isSoon = node.status === 'soon'
  const badge = STATUS_BADGE[node.status]

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('application/creavidy-node', node.id)
    e.dataTransfer.effectAllowed = 'copy'
  }, [node.id])

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onAdd(node)}
      title={node.description}
      className={`
        group flex items-center gap-2 px-2 py-1.5 rounded-lg
        transition-all duration-150 cursor-grab select-none
        hover:bg-white/8 active:bg-white/12
        ${isSoon ? 'opacity-50' : ''}
      `}
    >
      {/* Icon */}
      <span className="text-base w-6 text-center shrink-0">{node.icon}</span>

      {/* Label + desc */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-zinc-200 truncate">
            {node.label}
          </span>
          {node.isNew && (
            <span className="text-[9px] px-1 py-0 rounded bg-[#D1FE17]/20 text-[#D1FE17] border border-[#D1FE17]/30 font-bold leading-4">
              NEW
            </span>
          )}
          {badge.label && (
            <span className={`text-[9px] px-1 py-0 rounded font-bold leading-4 ${badge.cls}`}>
              {badge.label}
            </span>
          )}
        </div>
        {/* Provider */}
        {node.provider && (
          <span className="text-[10px] text-zinc-500 leading-tight">{node.provider}</span>
        )}
      </div>

      {/* Credit badge */}
      <CreditBadge cost={node.creditCost} />
    </div>
  )
}

// Category section (collapsible)
function CategorySection({
  category,
  nodes,
  onAdd,
  defaultOpen = false,
}: {
  category: typeof CATEGORY_META[0]
  nodes: NodeDefinition[]
  onAdd: (node: NodeDefinition) => void
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const activeCount = nodes.filter(n => n.status === 'active').length

  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors"
      >
        <span className="text-sm">{category.icon}</span>
        <span className="flex-1 text-left text-xs font-semibold text-zinc-300 tracking-wide uppercase">
          {category.label}
        </span>
        <span className="text-[10px] text-zinc-500 mr-1">{activeCount}/{nodes.length}</span>
        {open
          ? <ChevronDown className="w-3 h-3 text-zinc-500" />
          : <ChevronRight className="w-3 h-3 text-zinc-500" />
        }
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-1 pb-2 space-y-0.5">
              {nodes.map(n => (
                <NodeCard key={n.id} node={n} onAdd={onAdd} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export function NodeLibrarySidebar({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const { nodes, setNodes } = useWorkspaceStore()

  // Add node to canvas at center
  const handleAdd = useCallback((def: NodeDefinition) => {
    const id = `${def.id}-${Date.now()}`
    // Find a non-overlapping position
    const offset = nodes.length * 30
    const newNode: Node<NodeData> = {
      id,
      type: def.id,
      position: { x: 300 + offset, y: 150 + offset },
      data: {
        label: def.label,
        type: def.id.replace('Node', ''),
        status: 'idle',
        config: {} as any,
      },
    }
    setNodes([...nodes, newNode])
  }, [nodes, setNodes])

  // Search results
  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    return searchNodes(query)
  }, [query])

  // Categorized nodes
  const categorized = useMemo(() => {
    return CATEGORY_META.map(cat => ({
      cat,
      nodes: getNodesByCategory(cat.id),
    })).filter(c => c.nodes.length > 0)
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: -260, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -260, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute left-0 top-0 h-full z-20 flex flex-col"
          style={{ width: 240 }}
        >
          {/* Glassmorphism panel */}
          <div className="flex flex-col h-full bg-[#0F051D]/95 backdrop-blur-xl border-r border-[#2D1A4A] shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2D1A4A] shrink-0">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D1FE17]" />
                <span className="text-xs font-bold text-zinc-200 tracking-wide">NODE LIBRARY</span>
              </div>
              <button
                onClick={onClose}
                className="p-0.5 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>

            {/* Search */}
            <div className="px-2 py-2 shrink-0 border-b border-[#2D1A4A]">
              <div className="flex items-center gap-2 bg-white/6 rounded-lg px-2.5 py-1.5">
                <Search className="w-3 h-3 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Node ara..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-500 outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')}>
                    <X className="w-3 h-3 text-zinc-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Content — scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">

              {/* Search results */}
              {query.trim() ? (
                <div className="p-2">
                  {searchResults.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-6">
                      "{query}" için sonuç bulunamadı
                    </p>
                  ) : (
                    <div className="space-y-0.5">
                      {searchResults.map(n => (
                        <NodeCard key={n.id} node={n} onAdd={handleAdd} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Categorized list */
                <div>
                  {categorized.map(({ cat, nodes: catNodes }, i) => (
                    <CategorySection
                      key={cat.id}
                      category={cat}
                      nodes={catNodes}
                      onAdd={handleAdd}
                      defaultOpen={i < 2}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-3 py-2 border-t border-[#2D1A4A] shrink-0">
              <p className="text-[10px] text-zinc-600 text-center">
                Canvas'a sürükle veya tıkla
              </p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
