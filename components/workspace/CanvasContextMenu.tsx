'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Mic, Paintbrush, Film, Download, Search, Terminal, ListTree, ArrowRightLeft, Repeat, Settings } from 'lucide-react'
import { useWorkspaceStore, NODE_COLORS, DEFAULT_CONFIGS, type NodeData, type AnyNodeConfig } from '@/lib/stores/workspace-store'
import type { Node } from 'reactflow'

const MENU_ITEMS = [
  { nodeType: 'scriptNode', dataType: 'script', label: 'Prompt', icon: FileText },
  { nodeType: 'llmNode', dataType: 'llm', label: 'LLM Node', icon: Terminal },
  { nodeType: 'systemPromptNode', dataType: 'systemPrompt', label: 'System Prompt', icon: Settings },
  { nodeType: 'arrayNode', dataType: 'array', label: 'Array / List', icon: ListTree },
  { nodeType: 'textIteratorNode', dataType: 'textIterator', label: 'Text Iterator', icon: Repeat },
  { nodeType: 'routerNode', dataType: 'router', label: 'Router', icon: ArrowRightLeft },
  { nodeType: 'voiceNode', dataType: 'voice', label: 'Voice TTS', icon: Mic },
  { nodeType: 'imageGenNode', dataType: 'imageGen', label: 'Image Generator', icon: Paintbrush },
  { nodeType: 'videoGenNode', dataType: 'videoGen', label: 'Video Generator', icon: Film },
  { nodeType: 'exportNode', dataType: 'export', label: 'Export Video', icon: Download },
]

export function CanvasContextMenu() {
  const { contextMenu, setContextMenu, addNode } = useWorkspaceStore()
  const menuRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Close on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu, setContextMenu])

  const handleAddNode = (item: typeof MENU_ITEMS[number]) => {
    if (!contextMenu) return
    const newNode: Node<NodeData> = {
      id: `${item.dataType}-${Date.now()}`,
      type: item.nodeType,
      position: { x: contextMenu.canvasX, y: contextMenu.canvasY },
      data: {
        label: item.label,
        type: item.dataType,
        status: 'idle',
        config: { ...DEFAULT_CONFIGS[item.dataType] } as AnyNodeConfig,
      },
    }
    addNode(newNode)
    setContextMenu(null)
  }

  // Auto-focus search input when menu opens
  const searchInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (contextMenu) {
      setSearchQuery('')
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [contextMenu])

  const filteredItems = MENU_ITEMS.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <AnimatePresence>
      {contextMenu && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.12 }}
          className="fixed z-[100] w-[240px] rounded-xl bg-[#1a0d2e] border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[400px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {/* Search bar */}
          <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-600 outline-none"
            />
          </div>

          <div className="overflow-y-auto custom-scrollbar overflow-x-hidden">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-4 text-center text-xs text-zinc-500">No nodes found</div>
            ) : (
              filteredItems.map((item) => {
                const color = NODE_COLORS[item.dataType] || '#a78bfa'
                const Icon = item.icon
                return (
                  <button
                    key={item.nodeType}
                    onClick={() => handleAddNode(item)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <span className="text-xs text-white font-medium truncate">{item.label}</span>
                  </button>
                )
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
