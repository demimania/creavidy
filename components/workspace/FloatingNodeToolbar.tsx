'use client'
import { useWorkspaceStore } from '@/lib/stores/workspace-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Copy } from 'lucide-react'
import { useCallback } from 'react'
import type { Node } from 'reactflow'
import type { NodeData } from '@/lib/stores/workspace-store'

export function FloatingNodeToolbar() {
  const { nodes, edges, setNodes, setEdges, selectedNodeId, _pushHistory } = useWorkspaceStore()

  const selectedNode = nodes.find(n => n.id === selectedNodeId)

  const handleDelete = useCallback(() => {
    if (!selectedNodeId) return
    _pushHistory()
    setNodes(nodes.filter(n => n.id !== selectedNodeId))
    setEdges(edges.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId))
  }, [nodes, edges, selectedNodeId, setNodes, setEdges, _pushHistory])

  const handleDuplicate = useCallback(() => {
    if (!selectedNode) return
    _pushHistory()
    const copy: Node<NodeData> = {
      ...selectedNode,
      id: `${selectedNode.id}-copy-${Date.now()}`,
      position: { x: selectedNode.position.x + 40, y: selectedNode.position.y + 40 },
      selected: false,
    }
    setNodes([...nodes.map(n => ({ ...n, selected: false })), copy])
  }, [selectedNode, nodes, setNodes, _pushHistory])

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.12 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2 py-1.5 rounded-xl"
          style={{
            background: 'rgba(10, 4, 20, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <span className="text-[10px] text-zinc-500 px-1 mr-1 border-r border-white/10 pr-2">
            {selectedNode.data?.label || 'Node'}
          </span>

          <button
            onClick={handleDuplicate}
            title="Duplicate (⌘D)"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/8 transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>

          <button
            onClick={handleDelete}
            title="Delete (Del)"
            className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/8 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
