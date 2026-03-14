'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronRight } from 'lucide-react'
import {
  NODE_DEFINITIONS,
  searchNodes,
  getNodesByCategory,
  type NodeDefinition,
  type NodeCategory,
} from '@/lib/constants/node-definitions'
import { useWorkspaceStore, DEFAULT_CONFIGS, type NodeData, type AnyNodeConfig } from '@/lib/stores/workspace-store'
import type { Node } from 'reactflow'

// ─── Popular nodes (her zaman üstte) ─────────────────────────────────────────
const POPULAR_IDS = [
  'videoBriefNode', 'filmStripNode', 'scriptNode', 'llmNode',
  'imageGenFluxSchnellNode', 'videoGenKling3StdT2VNode', 'voiceNode', 'removeBackgroundNode',
]

// ─── Birleştirilmiş süper kategoriler ────────────────────────────────────────
const SUPER_CATS = [
  {
    id: 'popular',
    label: 'Popular',
    icon: '⭐',
    cats: [] as NodeCategory[], // özel: POPULAR_IDS'den gelir
  },
  {
    id: 'production',
    label: 'Production',
    icon: '🎬',
    cats: ['production'] as NodeCategory[],
  },
  {
    id: 'text',
    label: 'Text & LLM',
    icon: '📝',
    cats: ['text'] as NodeCategory[],
  },
  {
    id: 'image',
    label: 'Image',
    icon: '🎨',
    cats: ['image-t2i', 'image-vector', 'image-edit', 'image-i2i', 'image-enhance', 'toolbox-editing', 'toolbox-matte'] as NodeCategory[],
  },
  {
    id: 'video',
    label: 'Video',
    icon: '🎥',
    cats: ['video-gen', 'video-v2v', 'video-lipsync', 'video-enhance'] as NodeCategory[],
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: '⚡',
    cats: ['helpers', 'iterators', 'datatypes'] as NodeCategory[],
  },
  {
    id: '3d',
    label: '3D',
    icon: '🧊',
    cats: ['3d'] as NodeCategory[],
  },
  {
    id: 'ai-avatar',
    label: 'AI Avatar',
    icon: '🧑‍💻',
    cats: ['ai-avatar'] as NodeCategory[],
  },
  {
    id: 'community',
    label: 'Community',
    icon: '🌐',
    cats: ['community'] as NodeCategory[],
  },
]

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS: Record<string, string> = {
  beta: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  soon: 'bg-white/4 text-zinc-600 border border-white/6',
}

// ─── Sub-category header (used inside grouped panels) ─────────────────────────
function SubCatHeader({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 pt-2 pb-0.5">
      <span className="text-[10px]">{icon}</span>
      <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color }}>{label}</span>
      <div className="flex-1 h-[1px] ml-1" style={{ background: `linear-gradient(to right, ${color}30, transparent)` }} />
    </div>
  )
}

// ─── Categories that should render with sub-headers ────────────────────────────
const GROUPED_SUPER_CATS: Record<string, { id: string; icon: string; label: string; color: string }[]> = {
  'ai-avatar': [
    { id: 'heygen', icon: '🤖', label: 'HeyGen',  color: '#3b82f6' },
    { id: 'hedra',  icon: '✨', label: 'Hedra',   color: '#a855f7' },
    { id: 'runway', icon: '🚀', label: 'Runway',  color: '#f43f5e' },
  ],
}

// ─── Node row ─────────────────────────────────────────────────────────────────
function NodeRow({ node, onAdd }: { node: NodeDefinition; onAdd: (n: NodeDefinition) => void }) {
  const isSoon = node.status === 'soon'
  const badgeCls = STATUS[node.status]

  return (
    <button
      onClick={() => !isSoon && onAdd(node)}
      className={`w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md text-left transition-colors duration-75 group
        ${isSoon ? 'opacity-35 cursor-default' : 'hover:bg-white/6 cursor-pointer'}`}
    >
      <span className="text-[13px] w-4 shrink-0 text-center leading-none">{node.icon}</span>
      <span className={`flex-1 text-[11px] truncate ${isSoon ? 'text-zinc-600' : 'text-zinc-300 group-hover:text-white'}`}>
        {node.label}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        {node.isNew && !isSoon && (
          <span className="text-[7px] px-1 rounded-sm bg-[#D1FE17]/15 text-[#D1FE17] border border-[#D1FE17]/20 font-bold tracking-wide leading-4">NEW</span>
        )}
        {badgeCls && (
          <span className={`text-[7px] px-1 rounded-sm font-bold tracking-wide leading-4 ${badgeCls}`}>
            {node.status === 'beta' ? 'BETA' : 'SOON'}
          </span>
        )}
        {node.creditCost && !isSoon && (
          <span className="text-[10px] text-[#D1FE17]/50 font-mono">{typeof node.creditCost === 'number' ? `${node.creditCost}cr` : node.creditCost}</span>
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
  const [activeSuper, setActiveSuper] = useState('popular')

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) setContextMenu(null)
    }
    if (contextMenu) {
      setTimeout(() => document.addEventListener('mousedown', handle), 0)
      return () => document.removeEventListener('mousedown', handle)
    }
  }, [contextMenu, setContextMenu])

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') setContextMenu(null) }
    if (contextMenu) {
      document.addEventListener('keydown', handle)
      return () => document.removeEventListener('keydown', handle)
    }
  }, [contextMenu, setContextMenu])

  useEffect(() => {
    if (contextMenu) {
      setQuery('')
      setActiveSuper('popular')
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [contextMenu])

  const handleAdd = useCallback((def: NodeDefinition) => {
    if (!contextMenu) return
    addNode({
      id: `${def.id}-${Date.now()}`,
      type: def.id,
      position: { x: contextMenu.canvasX, y: contextMenu.canvasY },
      data: {
        label: def.label,
        type: def.id.replace('Node', ''),
        status: 'idle',
        config: { ...(DEFAULT_CONFIGS as any)[def.id.replace('Node', '')] } as AnyNodeConfig,
      },
    } as Node<NodeData>)
    setContextMenu(null)
  }, [contextMenu, addNode, setContextMenu])

  // Nodes for active super-cat
  const getNodesForSuper = (superId: string): NodeDefinition[] => {
    if (superId === 'popular') {
      return POPULAR_IDS
        .map(id => NODE_DEFINITIONS.find(n => n.id === id))
        .filter(Boolean) as NodeDefinition[]
    }
    const sc = SUPER_CATS.find(s => s.id === superId)
    if (!sc) return []
    return sc.cats.flatMap(cat => getNodesByCategory(cat))
  }

  const activeNodes = getNodesForSuper(activeSuper)
  const searchResults = query.trim() ? searchNodes(query) : []
  const isSearching = query.trim().length > 0

  // Smart position
  const pos: React.CSSProperties = {}
  if (contextMenu) {
    const W = 340, H = 300
    const vw = window.innerWidth, vh = window.innerHeight
    pos.left = contextMenu.x + W > vw ? Math.max(4, contextMenu.x - W) : contextMenu.x
    pos.top  = contextMenu.y + H > vh ? Math.max(4, contextMenu.y - H) : contextMenu.y
  }

  return (
    <AnimatePresence>
      {contextMenu && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-[100] flex flex-col overflow-hidden"
          style={{
            width: 340,
            maxHeight: 300,
            background: 'rgba(18, 8, 38, 0.97)',
            border: '1px solid rgba(167,139,250,0.18)',
            borderRadius: 10,
            boxShadow: '0 8px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(167,139,250,0.08)',
            backdropFilter: 'blur(24px)',
            ...pos,
          }}
        >
          {/* Search */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-white/6 shrink-0">
            <Search className="w-3 h-3 text-zinc-600 shrink-0" />
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search nodes..."
              className="flex-1 bg-transparent text-[11px] text-zinc-300 placeholder-zinc-600 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X className="w-3 h-3 text-zinc-700 hover:text-zinc-500" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {isSearching ? (
              /* Search results */
              <div className="flex-1 overflow-y-auto py-1 px-1" style={{ scrollbarWidth: 'none' }}>
                {searchResults.length === 0
                  ? <p className="text-[10px] text-zinc-600 text-center py-6">No results for "{query}"</p>
                  : searchResults.map(n => <NodeRow key={n.id} node={n} onAdd={handleAdd} />)
                }
              </div>
            ) : (
              <>
                {/* Left — super categories */}
                <div className="shrink-0 border-r border-white/6 overflow-y-auto py-1" style={{ width: 110, scrollbarWidth: 'none' }}>
                  {SUPER_CATS.map(sc => {
                    const isActive = sc.id === activeSuper
                    const nodes = getNodesForSuper(sc.id)
                    const activeCount = nodes.filter(n => n.status === 'active').length
                    return (
                      <button
                        key={sc.id}
                        onMouseEnter={() => setActiveSuper(sc.id)}
                        onClick={() => setActiveSuper(sc.id)}
                        className={`w-full flex items-center gap-1.5 px-2 py-[5px] text-left relative transition-colors duration-75
                          ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        {isActive && <span className="absolute left-0 inset-y-1 w-[2px] bg-[#a78bfa] rounded-full" />}
                        <span className="text-[12px] leading-none">{sc.icon}</span>
                        <span className="flex-1 text-[10px] font-medium truncate">{sc.label}</span>
                        {activeCount > 0 && (
                          <span className={`text-[9px] font-mono ${isActive ? 'text-[#a78bfa]/60' : 'text-zinc-700'}`}>{activeCount}</span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Right — nodes (grouped or flat) */}
                <div className="flex-1 overflow-y-auto py-1 px-1" style={{ scrollbarWidth: 'none' }}>
                  {activeNodes.length === 0 ? (
                    <p className="text-[10px] text-zinc-600 text-center py-6">No nodes</p>
                  ) : GROUPED_SUPER_CATS[activeSuper] ? (
                    // Grouped rendering with sub-headers
                    GROUPED_SUPER_CATS[activeSuper].map(group => {
                      const groupNodes = activeNodes.filter(n => n.subcategory === group.id)
                      if (groupNodes.length === 0) return null
                      return (
                        <div key={group.id}>
                          <SubCatHeader icon={group.icon} label={group.label} color={group.color} />
                          {groupNodes.map(n => <NodeRow key={n.id} node={n} onAdd={handleAdd} />)}
                        </div>
                      )
                    })
                  ) : (
                    // Flat rendering
                    activeNodes.map(n => <NodeRow key={n.id} node={n} onAdd={handleAdd} />)
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
