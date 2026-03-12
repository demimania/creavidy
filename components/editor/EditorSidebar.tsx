'use client'

import { Type, FileText, Link2, MessageSquare } from 'lucide-react'

interface EditorSidebarProps {
  activeIcon?: string
  onIconClick?: (icon: string) => void
}

const SIDEBAR_ICONS = [
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'files', icon: FileText, label: 'Files' },
  { id: 'links', icon: Link2, label: 'Links' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
]

export function EditorSidebar({ activeIcon, onIconClick }: EditorSidebarProps) {
  return (
    <div className="w-12 flex-shrink-0 border-r border-white/10 flex flex-col items-center py-4 gap-3 bg-black/30">
      {SIDEBAR_ICONS.map(item => {
        const Icon = item.icon
        const isActive = activeIcon === item.id
        return (
          <button
            key={item.id}
            onClick={() => onIconClick?.(item.id)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              isActive
                ? 'bg-[#0ea5e9]/15 text-[#0ea5e9]'
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
            title={item.label}
          >
            <Icon className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  )
}
