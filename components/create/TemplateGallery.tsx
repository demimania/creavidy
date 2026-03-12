'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Clock, Sparkles, Tag } from 'lucide-react'

interface Template {
  id: string
  title: string
  category: string
  duration: string
  gradient: string
  tag: string
}

const TEMPLATES: Template[] = [
  { id: '1', title: 'Product Launch', category: 'Marketing', duration: '30s', gradient: 'linear-gradient(135deg, #FF2D78, #a78bfa)', tag: '🔥 Popular' },
  { id: '2', title: 'Tutorial Explainer', category: 'Education', duration: '60s', gradient: 'linear-gradient(135deg, #0ea5e9, #06d6a0)', tag: '📚 Education' },
  { id: '3', title: 'Social Media Reel', category: 'Social', duration: '15s', gradient: 'linear-gradient(135deg, #FFE744, #FF2D78)', tag: '📱 Trending' },
  { id: '4', title: 'Corporate Intro', category: 'Business', duration: '45s', gradient: 'linear-gradient(135deg, #1a1a2e, #0f3460)', tag: '🏢 Business' },
  { id: '5', title: 'YouTube Shorts', category: 'Social', duration: '30s', gradient: 'linear-gradient(135deg, #D1FE17, #06d6a0)', tag: '▶️ YouTube' },
  { id: '6', title: 'AI Avatar Pitch', category: 'Pitch', duration: '60s', gradient: 'linear-gradient(135deg, #a78bfa, #FF2D78)', tag: '🤖 AI Special' },
]

const CATEGORIES = ['All', 'Marketing', 'Education', 'Social', 'Business', 'Pitch']

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === activeCategory)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#FFE744]" />
          Templates
        </h3>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-[#D1FE17]/15 text-[#D1FE17] border border-[#D1FE17]/30'
                : 'text-zinc-500 hover:text-zinc-300 bg-white/[0.03] border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto">
        {filtered.map((template, i) => (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelectTemplate(template)}
            className="group relative rounded-xl overflow-hidden text-left border border-white/10 hover:border-white/25 transition-all hover:shadow-lg"
          >
            {/* Thumbnail */}
            <div
              className="w-full aspect-video relative"
              style={{ background: template.gradient }}
            >
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all">
                  <Play className="w-4 h-4 text-black ml-0.5" />
                </div>
              </div>

              {/* Tag badge */}
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[9px] text-white font-medium">
                {template.tag}
              </span>

              {/* Duration badge */}
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] text-zinc-300 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {template.duration}
              </span>
            </div>

            {/* Info */}
            <div className="p-2.5 bg-white/[0.02]">
              <p className="text-xs font-medium text-white truncate">{template.title}</p>
              <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                <Tag className="w-2.5 h-2.5" />
                {template.category}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
