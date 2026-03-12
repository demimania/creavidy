'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export interface StyleOption {
  id: string
  name: string
  thumbnail: string  // gradient placeholder for now
  description: string
}

const STYLES: StyleOption[] = [
  { id: 'cinematic', name: 'Cinematic', thumbnail: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)', description: 'Hollywood film look' },
  { id: 'anime', name: 'Anime', thumbnail: 'linear-gradient(135deg, #ff6b9d, #c44dff, #6e3cbc)', description: 'Japanese animation' },
  { id: 'realistic', name: 'Realistic', thumbnail: 'linear-gradient(135deg, #2d5016, #567d2e, #8fbc55)', description: 'Photorealistic footage' },
  { id: 'abstract', name: 'Abstract', thumbnail: 'linear-gradient(135deg, #FFE744, #FF2D78, #a78bfa)', description: 'Creative & artistic' },
  { id: '3d-render', name: '3D Render', thumbnail: 'linear-gradient(135deg, #0ea5e9, #06d6a0, #D1FE17)', description: 'Pixar-style 3D' },
  { id: 'vintage', name: 'Vintage', thumbnail: 'linear-gradient(135deg, #92400e, #b5651d, #d4a054)', description: 'Retro film grain' },
]

interface StyleCardProps {
  style: StyleOption
  isSelected: boolean
  onSelect: (id: string) => void
}

function StyleCard({ style, isSelected, onSelect }: StyleCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(style.id)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`relative rounded-xl overflow-hidden text-left transition-all group ${
        isSelected
          ? 'ring-2 ring-[#D1FE17] ring-offset-2 ring-offset-[#0F051D]'
          : 'ring-1 ring-white/10 hover:ring-white/25'
      }`}
    >
      {/* Thumbnail */}
      <div
        className="w-full aspect-[4/3] relative"
        style={{ background: style.thumbnail }}
      >
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#D1FE17] flex items-center justify-center"
          >
            <Check className="w-3 h-3 text-black" />
          </motion.div>
        )}
      </div>

      {/* Label */}
      <div className="p-2 bg-white/[0.03]">
        <p className="text-xs font-medium text-white truncate">{style.name}</p>
        <p className="text-[10px] text-zinc-500 truncate">{style.description}</p>
      </div>
    </motion.button>
  )
}

interface StyleGridProps {
  selectedStyle: string
  onStyleChange: (id: string) => void
}

export function StyleGrid({ selectedStyle, onStyleChange }: StyleGridProps) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Style</label>
      <div className="grid grid-cols-3 gap-2">
        {STYLES.map(style => (
          <StyleCard
            key={style.id}
            style={style}
            isSelected={selectedStyle === style.id}
            onSelect={onStyleChange}
          />
        ))}
      </div>
    </div>
  )
}

export { STYLES }
