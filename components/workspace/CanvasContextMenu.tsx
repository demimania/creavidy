'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, ChevronRight, X } from 'lucide-react'
import {
  CATEGORY_META,
  searchNodes,
  getNodesByCategory,
  type NodeDefinition,
} from '@/lib/constants/node-definitions'
import { useWorkspaceStore, DEFAULT_CONFIGS, type NodeData, type AnyNodeConfig } from '@/lib/stores/workspace-store'
import type { Node } from 'reactflow'

// ─── Status badges ────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active: { label: '',      cls: '' },
  beta:   { label: 'BETA', cls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  soon:   { label: 'SOON', cls: 'bg-zinc-700/60 text-zinc-400 border border-zinc-600/30' },
}

// ─── Category section (collapsible) ──────────────────────────────────────────
function CategorySection({
  category,
  nodes,
  onAdd,
  defaultOpen = false,
}: {
  category: typeof CATEGORY_META[0]
  nodes: NodeDefinition[]
  onAdd: (def: NodeDefinition) => void
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
        <span className="flex-1 text-left text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
          {category.label}
        </span>
        <span className="text-[9px] text-zinc-600 mr-1">{activeCount}/{nodes.length}</span>
        {open
          ? <ChevronDown className="w-3 h-3 text-zinc-600" />
          : <ChevronRight className="w-3 h-3 text-zinc-600" />
        }
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-1 pb-1.5 space-y-0.5">
              {nodes.map(node => {
                const isSoon = node.status === 'soon'
                const badge = STATUS_BADGE[node.status]
                return (
                  <button
                    key={node.id}
                    onClick={() => onAdd(node)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-white/8 transition-colors ${isSoon ? 'opacity-50' : ''}`}
                  >
                    <span className="text-sm w-5 text-center shrink-0">{node.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs text-zinc-200 font-medium truncate">{node.label}</span>
                        {node.isNew && (
                          <span className="text-[8px] px-1 rounded bg-[#D1FE17]/20 text-[#D1FE17] border border-[#D1FE17]/30 font-bold leading-4">NEW</span>
                        )}
                        {badge.label && (
                          <span className={`text-[8px] px-1 rounded font-bold leading-4 ${badge.cls}`}>{badge.label}</span>
                        )}
                      </div>
                      {node.provider && (
                        <span className="text-[9px] text-zinc-500 leading-tight">{node.provider}</span>
                      )}
                    </div>
                    {node.creditCost && (
                      <span className="text-[9px] text-[#D1FE17] font-mono opacity-70 shrink-0">
                        {typeof node.creditCost === 'number' ? `${node.creditCost}cr` : node.creditCost}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Context Menu ────────────────────────────────────────────────────────
export function CanvasContextMenu() {
  const { contextMenu, setContextMenu, addNode } = useWorkspaceStore()
  const menuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) {
        setContextMenu(null)
      }
    }
    if (contextMenu) {
      // slight delay so the right-click that opened it doesn't immediately close it
      setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [contextMenu, setContextMenu])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setContextMenu(null) }
    if (contextMenu) {
      document.addEventListener('keydown', handleKey)
      return () => document.removeEventListener('keydown', handleKey)
    }
  }, [contextMenu, setContextMenu])

  // Auto-focus search on open
  useEffect(() => {
    if (contextMenu) {
      setSearchQuery('')
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [contextMenu])

  const handleAdd = useCallback((def: NodeDefinition) => {
    if (!contextMenu) return
    const newNode: Node<NodeData> = {
      id: `${def.id}-${Date.now()}`,
      type: def.id,
      position: { x: contextMenu.canvasX, y: contextMenu.canvasY },
      data: {
        label: def.label,
        type: def.id.replace('Node', ''),
        status: 'idle',
        config: { ...(DEFAULT_CONFIGS as any)[def.id.replace('Node', '')] } as AnyNodeConfig,
      },
    }
    addNode(newNode)
    setContextMenu(null)
  }, [contextMenu, addNode, setContextMenu])

  // Search results
  const searchResults = searchQuery.trim() ? searchNodes(searchQuery) : []

  // Categorized
  const categorized = CATEGORY_META.map(cat => ({
    cat,
    nodes: getNodesByCategory(cat.id),
  })).filter(c => c.nodes.length > 0)

  // Smart positioning — keep menu in viewport
  const menuStyle: React.CSSProperties = {}
  if (contextMenu) {
    const W = 260
    const H = 480
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1920
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1080
    menuStyle.left = contextMenu.x + W > vw ? contextMenu.x - W : contextMenu.x
    menuStyle.top  = contextMenu.y + H > vh ? contextMenu.y - H : contextMenu.y
  }

  return (
    <AnimatePresence>
      {contextMenu && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.92, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -4 }}
          transition={{ duration: 0.12 }}
          className="fixed z-[100] flex flex-col rounded-xl bg-[#130827]/98 border border-[#2D1A4A] shadow-2xl shadow-black/60 backdrop-blur-xl overflow-hidden"
          style={{ width: 260, maxHeight: 480, ...menuStyle }}
        >
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/8 shrink-0">
            <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Node ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X className="w-3 h-3 text-zinc-600 hover:text-zinc-400" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {searchQuery.trim() ? (
              /* Search results */
              <div className="p-1.5">
                {searchResults.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 text-center py-6">"{searchQuery}" için sonuç yok</p>
                ) : (
                  searchResults.map(node => {
                    const isSoon = node.status === 'soon'
                    const badge = STATUS_BADGE[node.status]
                    return (
                      <button
                        key={node.id}
                        onClick={() => handleAdd(node)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-white/8 transition-colors ${isSoon ? 'opacity-50' : ''}`}
                      >
                        <span className="text-sm w-5 text-center shrink-0">{node.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-xs text-zinc-200 font-medium truncate">{node.label}</span>
                            {node.isNew && (
                              <span className="text-[8px] px-1 rounded bg-[#D1FE17]/20 text-[#D1FE17] border border-[#D1FE17]/30 font-bold leading-4">NEW</span>
                            )}
                            {badge.label && (
                              <span className={`text-[8px] px-1 rounded font-bold leading-4 ${badge.cls}`}>{badge.label}</span>
                            )}
                          </div>
                          {node.provider && (
                            <span className="text-[9px] text-zinc-500 leading-tight">{node.provider}</span>
                          )}
                        </div>
                        {node.creditCost && (
                          <span className="text-[9px] text-[#D1FE17] font-mono opacity-70 shrink-0">
                            {typeof node.creditCost === 'number' ? `${node.creditCost}cr` : node.creditCost}
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            ) : (
              /* Categorized */
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
