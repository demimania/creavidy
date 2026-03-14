'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronRight } from 'lucide-react'
import {
  CATEGORY_META,
  searchNodes,
  getNodesByCategory,
  type NodeDefinition,
} from '@/lib/constants/node-definitions'
import { useWorkspaceStore, DEFAULT_CONFIGS, type NodeData, type AnyNodeConfig } from '@/lib/stores/workspace-store'
import type { Node } from 'reactflow'

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS: Record<string, { label: string; cls: string }> = {
  beta: { label: 'BETA', cls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  soon: { label: 'SOON', cls: 'bg-white/5 text-zinc-500 border border-white/8' },
}

// ─── Single node row ──────────────────────────────────────────────────────────
function NodeRow({ node, onAdd }: { node: NodeDefinition; onAdd: (n: NodeDefinition) => void }) {
  const badge = STATUS[node.status]
  const isSoon = node.status === 'soon'

  return (
    <button
      onClick={() => !isSoon && onAdd(node)}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-100
        ${isSoon
          ? 'opacity-40 cursor-default'
          : 'hover:bg-[#D1FE17]/5 hover:border-[#D1FE17]/10 border border-transparent cursor-pointer group'
        }
      `}
    >
      {/* Icon */}
      <span className="text-base w-5 text-center shrink-0 leading-none">{node.icon}</span>

      {/* Label */}
      <span className={`flex-1 text-[12px] font-medium truncate ${isSoon ? 'text-zinc-500' : 'text-zinc-200 group-hover:text-white'}`}>
        {node.label}
      </span>

      {/* Badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        {node.isNew && !isSoon && (
          <span className="text-[8px] px-1 py-px rounded bg-[#D1FE17]/15 text-[#D1FE17] border border-[#D1FE17]/25 font-bold tracking-wide">
            NEW
          </span>
        )}
        {badge?.label && (
          <span className={`text-[8px] px-1 py-px rounded font-bold tracking-wide ${badge.cls}`}>
            {badge.label}
          </span>
        )}
        {node.creditCost && !isSoon && (
          <span className="text-[10px] text-[#D1FE17]/60 font-mono tabular-nums">
            {typeof node.creditCost === 'number' ? `${node.creditCost}cr` : node.creditCost}
          </span>
        )}
      </div>
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function CanvasContextMenu() {
  const { contextMenu, setContextMenu, addNode } = useWorkspaceStore()
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState<string>(CATEGORY_META[0]?.id ?? '')

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) {
        setContextMenu(null)
      }
    }
    if (contextMenu) {
      setTimeout(() => document.addEventListener('mousedown', handle), 0)
      return () => document.removeEventListener('mousedown', handle)
    }
  }, [contextMenu, setContextMenu])

  // Close on Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') setContextMenu(null) }
    if (contextMenu) {
      document.addEventListener('keydown', handle)
      return () => document.removeEventListener('keydown', handle)
    }
  }, [contextMenu, setContextMenu])

  // Reset & focus on open
  useEffect(() => {
    if (contextMenu) {
      setQuery('')
      setActiveCat(CATEGORY_META[0]?.id ?? '')
      setTimeout(() => searchRef.current?.focus(), 60)
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

  // Categories that have nodes
  const categories = CATEGORY_META.map(cat => ({
    ...cat,
    nodes: getNodesByCategory(cat.id),
  })).filter(c => c.nodes.length > 0)

  // Active category nodes
  const activeNodes = categories.find(c => c.id === activeCat)?.nodes ?? []

  // Search results
  const searchResults = query.trim() ? searchNodes(query) : []
  const isSearching = query.trim().length > 0

  // Smart position to stay in viewport
  const style: React.CSSProperties = {}
  if (contextMenu) {
    const W = 480, H = 420
    const vw = window.innerWidth, vh = window.innerHeight
    style.left = contextMenu.x + W > vw ? Math.max(8, contextMenu.x - W) : contextMenu.x
    style.top  = contextMenu.y + H > vh ? Math.max(8, contextMenu.y - H) : contextMenu.y
  }

  return (
    <AnimatePresence>
      {contextMenu && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -6 }}
          transition={{ duration: 0.13, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-[100] rounded-2xl overflow-hidden flex flex-col"
          style={{
            width: 480,
            maxHeight: 420,
            background: 'rgba(13, 5, 26, 0.97)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            ...style,
          }}
        >
          {/* Search bar */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/6 shrink-0">
            <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Node ara..."
              className="flex-1 bg-transparent text-[12px] text-zinc-200 placeholder-zinc-600 outline-none"
            />
            {query ? (
              <button onClick={() => setQuery('')} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="text-[9px] text-zinc-600 bg-white/5 border border-white/8 rounded px-1.5 py-0.5 font-mono">ESC</kbd>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">

            {isSearching ? (
              /* ── Search results (full width) ── */
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/8">
                {searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-zinc-600">
                    <Search className="w-6 h-6 mb-2 opacity-40" />
                    <p className="text-xs">"{query}" için sonuç bulunamadı</p>
                  </div>
                ) : (
                  searchResults.map(node => (
                    <NodeRow key={node.id} node={node} onAdd={handleAdd} />
                  ))
                )}
              </div>
            ) : (
              /* ── Two-panel: categories | nodes ── */
              <>
                {/* Left — category list */}
                <div
                  className="w-44 shrink-0 border-r border-white/6 overflow-y-auto py-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/8"
                >
                  {categories.map(cat => {
                    const isActive = cat.id === activeCat
                    const activeCount = cat.nodes.filter(n => n.status === 'active').length
                    return (
                      <button
                        key={cat.id}
                        onMouseEnter={() => setActiveCat(cat.id)}
                        onClick={() => setActiveCat(cat.id)}
                        className={`
                          w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all duration-100 relative
                          ${isActive
                            ? 'bg-[#a78bfa]/10 text-white'
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/4'
                          }
                        `}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#a78bfa] rounded-full" />
                        )}
                        <span className="text-sm leading-none shrink-0">{cat.icon}</span>
                        <span className="flex-1 text-[11px] font-medium leading-tight truncate">{cat.label}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-[9px] font-mono tabular-nums ${isActive ? 'text-[#a78bfa]/70' : 'text-zinc-700'}`}>
                            {activeCount}
                          </span>
                          <ChevronRight className={`w-2.5 h-2.5 ${isActive ? 'text-[#a78bfa]/50' : 'text-zinc-700'}`} />
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Right — node list */}
                <div className="flex-1 overflow-y-auto py-1.5 px-1.5 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/8">
                  {/* Category header */}
                  <div className="flex items-center gap-2 px-2 pb-1 mb-1 border-b border-white/5">
                    <span className="text-sm leading-none">
                      {categories.find(c => c.id === activeCat)?.icon}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                      {categories.find(c => c.id === activeCat)?.label}
                    </span>
                  </div>

                  {activeNodes.map(node => (
                    <NodeRow key={node.id} node={node} onAdd={handleAdd} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 shrink-0">
            <span className="text-[9px] text-zinc-700">Sağ-tık ile ekle · ESC kapat</span>
            <span className="text-[9px] text-zinc-700 font-mono">
              {categories.reduce((a, c) => a + c.nodes.length, 0)} node
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
