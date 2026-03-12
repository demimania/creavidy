'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, ChevronDown } from 'lucide-react'

interface ExportDialogProps {
  onClose: () => void
  onExport: (settings: ExportSettings) => void
}

interface ExportSettings {
  fileName: string
  quality: string
  resolution: string
  format: string
  fps: string
}

export function ExportDialog({ onClose, onExport }: ExportDialogProps) {
  const [settings, setSettings] = useState<ExportSettings>({
    fileName: 'Film Strip 1',
    quality: 'High',
    resolution: '1080p',
    format: 'mp4',
    fps: '24fps',
  })

  const QUALITIES = ['Low', 'Medium', 'High', 'Ultra']
  const RESOLUTIONS = ['720p', '1080p', '2K', '4K']
  const FORMATS = ['mp4', 'webm', 'mov']
  const FPS_OPTIONS = ['24fps', '30fps', '60fps']

  const SelectField = ({ label, value, options, onChange }: {
    label: string
    value: string
    options: string[]
    onChange: (val: string) => void
  }) => (
    <div>
      <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1.5">{label}</p>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-black dark:text-white focus:outline-none focus:border-[#0ea5e9] pr-8"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#1a1025] rounded-2xl w-full max-w-[400px] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/10">
          <h3 className="text-base font-semibold text-black dark:text-white">Export</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* File name */}
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">File name</p>
            <div className="relative">
              <input
                type="text"
                value={settings.fileName}
                onChange={(e) => setSettings(s => ({ ...s, fileName: e.target.value }))}
                maxLength={50}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-black dark:text-white focus:outline-none focus:border-[#0ea5e9]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400">
                {settings.fileName.length}/50
              </span>
            </div>
          </div>

          <SelectField label="Quality" value={settings.quality} options={QUALITIES} onChange={(v) => setSettings(s => ({ ...s, quality: v }))} />
          <SelectField label="Resolution" value={settings.resolution} options={RESOLUTIONS} onChange={(v) => setSettings(s => ({ ...s, resolution: v }))} />
          <SelectField label="Format" value={settings.format} options={FORMATS} onChange={(v) => setSettings(s => ({ ...s, format: v }))} />
          <SelectField label="Frame rate" value={settings.fps} options={FPS_OPTIONS} onChange={(v) => setSettings(s => ({ ...s, fps: v }))} />
        </div>

        {/* Export button */}
        <div className="px-5 pb-5">
          <button
            onClick={() => onExport(settings)}
            className="w-full py-3 rounded-xl bg-[#0ea5e9] text-white text-sm font-semibold hover:bg-[#0c96d4] transition-colors"
          >
            Export
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
