'use client'

import { motion } from 'framer-motion'
import { FileText, Mic, Paintbrush, Film, Subtitles, Download } from 'lucide-react'
import { NODE_COLORS } from '@/lib/stores/workspace-store'

interface PaletteItem {
  nodeType: string
  label: string
  icon: React.ElementType
  dataType: string
}

const PALETTE_ITEMS: PaletteItem[] = [
  { nodeType: 'scriptNode', label: 'Script Writer', icon: FileText, dataType: 'script' },
  { nodeType: 'voiceNode', label: 'Voice TTS', icon: Mic, dataType: 'voice' },
  { nodeType: 'imageGenNode', label: 'Image Gen', icon: Paintbrush, dataType: 'imageGen' },
  { nodeType: 'videoGenNode', label: 'Video Gen', icon: Film, dataType: 'videoGen' },
  { nodeType: 'captionNode', label: 'Captions', icon: Subtitles, dataType: 'caption' },
  { nodeType: 'exportNode', label: 'Export', icon: Download, dataType: 'export' },
  { nodeType: 'videoBriefNode', label: 'Video Brief', icon: FileText, dataType: 'videoBrief' },
  { nodeType: 'filmStripNode', label: 'Film Strip', icon: Film, dataType: 'filmStrip' },
]

interface NodePaletteProps {
  onAddNode: (nodeType: string, dataType: string, label: string) => void
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, item: PaletteItem) => {
    event.dataTransfer.setData('application/reactflow-type', item.nodeType)
    event.dataTransfer.setData('application/reactflow-data-type', item.dataType)
    event.dataTransfer.setData('application/reactflow-label', item.label)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="w-16 flex flex-col items-center py-3 gap-1.5 border-r border-white/10 bg-black/30 backdrop-blur-xl overflow-y-auto">
      <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1 -rotate-90 w-12">Nodes</p>

      {PALETTE_ITEMS.map((item, i) => {
        const color = NODE_COLORS[item.dataType] || '#a78bfa'
        const Icon = item.icon
        return (
          <div
            key={item.nodeType}
            draggable
            onDragStart={(e) => onDragStart(e, item)}
          >
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onAddNode(item.nodeType, item.dataType, item.label)}
              title={item.label}
              className="group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-110 cursor-grab active:cursor-grabbing"
              style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />

              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-[#1a0d2e] border border-white/15 text-[10px] text-white font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                {item.label}
              </div>
            </motion.button>
          </div>
        )
      })}
    </div>
  )
}
