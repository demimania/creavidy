'use client'

import { memo, useState, useEffect, useRef } from 'react'
import { Handle, Position, type NodeProps, useReactFlow } from 'reactflow'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Play, Loader2, ChevronDown, Check, Settings2, Image as ImageIcon, MonitorPlay, Film, Zap, Music, RefreshCw, Youtube, Instagram, Search, Filter, SlidersHorizontal, Plus, Square, Scissors, Trash, Download, Volume2, Edit2, Heart, TrendingUp, Maximize2, MoreHorizontal, X, ArrowLeft
} from 'lucide-react'
import { useWorkspaceStore, type NodeData, type VideoBriefConfig, type FilmStripConfig } from '@/lib/stores/workspace-store'
import { toast } from 'sonner'
import { CharacterSection } from '@/components/ui/character-section'

const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>
)

// Shared narrator options — module scope so both nodes can use them
const narratorOptions = [
  { name: 'Jolly Yapper', voiceId: 'alloy', img: 'https://randomuser.me/api/portraits/women/44.jpg', pitch: 1.2, rate: 1.1, text: "Hey there! I'm Jolly Yapper, and I'll be bringing your story to life!" },
  { name: 'Ms. Labebe', voiceId: 'fable', img: 'https://randomuser.me/api/portraits/women/68.jpg', pitch: 1.4, rate: 0.95, text: "Hello! I'm Ms. Labebe. It's wonderful to narrate your video today." },
  { name: 'Lady Holiday', voiceId: 'nova', img: 'https://randomuser.me/api/portraits/women/12.jpg', pitch: 1.1, rate: 0.9, text: "Welcome. I'm Lady Holiday. Let me guide your audience through this journey." },
  { name: 'Happy Dino', voiceId: 'echo', img: 'https://randomuser.me/api/portraits/men/32.jpg', pitch: 0.85, rate: 1.05, text: "Yo! Happy Dino here! Ready to make your content absolutely epic!" },
]

export const VideoBriefNodeContent = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const color = '#3b82f6'
  const updateNodeConfig = useWorkspaceStore((s) => s.updateNodeConfig)
  const setNodes = useWorkspaceStore((s) => s.setNodes)
  const setEdges = useWorkspaceStore((s) => s.setEdges)
  const nodes = useWorkspaceStore((s) => s.nodes)
  const edges = useWorkspaceStore((s) => s.edges)
  const { fitView } = useReactFlow()

  const config = data.config as VideoBriefConfig
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openDropdown) return
    const handleClickOutside = (e: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    // Using capture phase to ensure we beat ReactFlow's pan/zoom swallow
    document.addEventListener('mousedown', handleClickOutside, true)
    return () => document.removeEventListener('mousedown', handleClickOutside, true)
  }, [openDropdown])

  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)

    const narratorOption = narratorOptions.find(n => n.name === config.narrator) || narratorOptions[0]
    const narratorVoiceId = narratorOption.voiceId
    const newNodeId = `filmStrip-${Date.now()}`
    let mappedScenes: any[] = []

    // ── Step 1: Script generation ─────────────────────────────────────────────
    try {
      const durationToScenes: Record<string, number> = { '30': 3, '60': 5, '180': 10 }
      const numScenes = durationToScenes[String(config.duration)] || 3

      const res = await fetch('/api/generate/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.0',
          prompt: `${config.prompt}${config.theme ? '. Theme: ' + config.theme : ''}${config.visualStyle ? '. Visual style: ' + config.visualStyle : ''}. IMPORTANT: Each scene MUST be strictly 10 seconds or less.`,
          sceneCount: numScenes,
          language: 'English',
        }),
      })
      const scriptData = await res.json()
      if (!res.ok) throw new Error(scriptData.error || 'Script generation failed')

      let generatedScenes: any[] = []
      try { generatedScenes = JSON.parse(scriptData.script) } catch {
        generatedScenes = [{ scene_number: 1, duration_seconds: 5, visual_description: scriptData.script || 'Scene 1', narration: '' }]
      }

      let extractedCharacters = ''
      if (Array.isArray(scriptData.characters) && scriptData.characters.length > 0) {
        extractedCharacters = scriptData.characters.join(', ')
      }

      // Update the VideoBriefNode with the extracted characters
      updateNodeConfig(id, { character: extractedCharacters } as any)

      const now = Date.now()
      mappedScenes = generatedScenes.map((s: any, idx: number) => ({
        id: `scene-${now}-${idx}`,
        description: s.visual_description || s.description || `Scene ${idx + 1}`,
        duration: Math.min(s.duration_seconds || s.duration || 5, 10),
        script: s.narration || s.script || '',
        imageUrl: '', audioUrl: '', videoUrl: '', status: 'idle',
      }))

      const currentNode = nodes.find(n => n.id === id)
      if (!currentNode) throw new Error('Node not found')

      const newNode = {
        id: newNodeId,
        type: 'filmStripNode',
        position: { x: currentNode.position.x + 450, y: currentNode.position.y },
        data: {
          label: 'Film Strip 1',
          type: 'filmStrip',
          status: 'ready' as any,
          config: {
            scenes: mappedScenes,
            narratorVoiceId,
            visualStyle: config.visualStyle,
            generationPhase: 'tts' as const,
            generationProgress: 0,
          },
        },
        selected: false,
      }

      setNodes([...nodes, newNode])
      setEdges([...edges, {
        id: `e-${id}-${newNodeId}`,
        source: id, target: newNodeId,
        type: 'labeled',
        style: { stroke: color, strokeWidth: 2 },
        animated: true,
        data: { label: 'Scenes' },
      }])

      toast.success(`${mappedScenes.length} scenes created! Generating audio...`)
      setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 100)

    } catch (error: any) {
      toast.error(error.message || 'Failed to create script')
      setIsGenerating(false)
      return
    }

    setIsGenerating(false)

    // ── Step 2: Sequential background generation (TTS → Images) ──────────────
    const workingScenes = [...mappedScenes]
    const visualStyle = config.visualStyle

    try {
      // TTS phase
      for (let i = 0; i < workingScenes.length; i++) {
        updateNodeConfig(newNodeId, {
          scenes: [...workingScenes], generationPhase: 'tts',
          generationProgress: Math.round((i / workingScenes.length) * 100),
        })
        if (workingScenes[i].script) {
          try {
            const r = await fetch('/api/generate/tts', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ engine: 'openai-tts', text: workingScenes[i].script, voiceId: narratorVoiceId }),
            })
            const d = await r.json()
            if (d.audioUrl) workingScenes[i] = { ...workingScenes[i], audioUrl: d.audioUrl }
          } catch { /* skip this scene's TTS */ }
        }
        updateNodeConfig(newNodeId, {
          scenes: [...workingScenes], generationPhase: 'tts',
          generationProgress: Math.round(((i + 1) / workingScenes.length) * 100),
        })
      }

      toast.success('Audio ready! Generating visuals...')

      // Images phase
      let imageErrors = 0
      for (let i = 0; i < workingScenes.length; i++) {
        updateNodeConfig(newNodeId, {
          scenes: [...workingScenes], generationPhase: 'images',
          generationProgress: Math.round((i / workingScenes.length) * 100),
        })
        const s = workingScenes[i]
        if (s.description) {
          try {
            const prompt = visualStyle ? `${s.description}, ${visualStyle} style, cinematic` : s.description
            const r = await fetch('/api/generate/image', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ model: 'flux-schnell', prompt }),
            })
            const d = await r.json()
            if (d.imageUrl) {
              workingScenes[i] = { ...s, imageUrl: d.imageUrl, status: 'done' }
            } else {
              imageErrors++
              console.error(`[Image Scene ${i + 1}]`, d.error)
              toast.error(`Scene ${i + 1} image: ${d.error || 'fal.ai error'}`)
            }
          } catch (e: any) {
            imageErrors++
            toast.error(`Scene ${i + 1}: ${e.message}`)
          }
        }
        updateNodeConfig(newNodeId, {
          scenes: [...workingScenes], generationPhase: 'images',
          generationProgress: Math.round(((i + 1) / workingScenes.length) * 100),
        })
      }

      updateNodeConfig(newNodeId, {
        scenes: [...workingScenes], generationPhase: 'done', generationProgress: 100,
      })
      if (imageErrors === 0) {
        toast.success('Film strip ready! 🎬')
      } else {
        toast.warning(`${workingScenes.length - imageErrors}/${workingScenes.length} images generated`)
      }

    } catch (e: any) {
      toast.error(`Generation error: ${e.message}`)
    }
  }

  const dropdownButtonProps = (key: string) => ({
    onClick: () => setOpenDropdown(openDropdown === key ? null : key),
    className: `flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors w-full ${openDropdown === key ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-transparent hover:border-white/10'}`
  })

  // Mock Dropdown Options
  const styleOptions = [
    { id: "realistic", label: "Realistic Film", emoji: "🎬", color: "#e2e8f0" },
    { id: "cartoon3d", label: "Cartoon 3D", emoji: "🧊", color: "#a78bfa" },
    { id: "photograph", label: "Photograph", emoji: "📷", color: "#60a5fa" },
    { id: "anime", label: "Anime", emoji: "🌸", color: "#f472b6" },
    { id: "watercolor", label: "Watercolor", emoji: "🎨", color: "#34d399" },
    { id: "pixelart", label: "Pixel Art", emoji: "👾", color: "#fbbf24" },
  ];

  const [narratorTab, setNarratorTab] = useState<'Voice' | 'Avatar'>('Voice')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)

  const playNarratorPreview = (opt: typeof narratorOptions[0], e: React.MouseEvent) => {
    e.stopPropagation()
    if (playingPreview === opt.name) {
      window.speechSynthesis?.cancel()
      setPlayingPreview(null)
      return
    }
    window.speechSynthesis?.cancel()
    setPlayingPreview(opt.name)
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(opt.text)
      utter.pitch = opt.pitch
      utter.rate = opt.rate
      utter.onend = () => setPlayingPreview(null)
      utter.onerror = () => setPlayingPreview(null)
      window.speechSynthesis.speak(utter)
    } else {
      setPlayingPreview(null)
    }
  }

  const playMusicPreview = (name: string, volumeDb: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (playingPreview === name) {
      audioRef.current?.pause()
      audioRef.current = null
      masterGainRef.current = null
      setPlayingPreview(null)
      return
    }
    audioRef.current?.pause()
    window.speechSynthesis?.cancel()
    setPlayingPreview(name)
    try {
      const ctx = new AudioContext()
      // Master gain — dB → linear dönüşümü
      const masterGain = ctx.createGain()
      masterGain.gain.value = Math.pow(10, volumeDb / 20)
      masterGain.connect(ctx.destination)
      masterGainRef.current = masterGain

      const chords: Record<string, number[]> = {
        'Deep background...': [110, 138.6, 165, 220],
        'Background Music': [261.6, 329.6, 392, 523.3],
        'Positive background...': [293.7, 370, 440, 587.3],
        'Ambient Background': [164.8, 220, 261.6, 329.6],
        'Cinematic Intro': [130.8, 164.8, 196, 261.6],
        'LoFi Study Vibe': [220, 261.6, 329.6, 415.3],
        'Upbeat Pop': [349.2, 440, 523.3, 698.5],
        'Dark Synthwave': [98, 123.5, 146.8, 196],
      }
      const freqs = chords[name] || chords['Background Music']
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = i % 2 === 0 ? 'sine' : 'triangle'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.05)
        gain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + i * 0.05 + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3)
        osc.connect(gain)
        gain.connect(masterGain)
        osc.start(ctx.currentTime + i * 0.05)
        osc.stop(ctx.currentTime + 3)
      })
      setTimeout(() => { masterGainRef.current = null; setPlayingPreview(null) }, 3100)
    } catch {
      setPlayingPreview(null)
    }
  }

  const musicOptions = [
    { name: 'Deep background...', author: 'Art Music Style', duration: '02:49', color: '#10b981' },
    { name: 'Background Music', author: 'IlyaSound', duration: '03:36', color: '#3b82f6' },
    { name: 'Positive background...', author: 'earbrojp', duration: '03:04', color: '#f472b6' },
    { name: 'Ambient Background', author: 'Pumputhemind', duration: '01:24', color: '#8b5cf6' },
    { name: 'Cinematic Intro', author: 'HansZ', duration: '02:10', color: '#f59e0b' },
    { name: 'LoFi Study Vibe', author: 'ChillMix', duration: '04:20', color: '#8b5cf6' },
    { name: 'Upbeat Pop', author: 'SunnyDayz', duration: '02:55', color: '#ec4899' },
    { name: 'Dark Synthwave', author: 'NeonNight', duration: '03:45', color: '#6366f1' },
  ]
  const [musicVolume, setMusicVolume] = useState<Record<string, number>>({})
  const [playingPreview, setPlayingPreview] = useState<string | null>(null)

  const captionStyles = [
    { id: 'none', label: 'None', type: 'none' },
    { id: 'the-quick', label: 'THE QUICK', color: '#ffcc00', glow: false },
    { id: 'the-quick-brown', label: 'THE BROWN FOX', color: '#ffffff', glow: false },
    { id: 'nhe', label: 'NHE', color: '#0ea5e9', glow: true },
    { id: 'rapida', label: 'rapida', color: '#ec4899', glow: true },
    { id: 'cepat', label: 'cepat', color: '#8b5cf6', glow: true },
    { id: 'auca', label: 'AUCA', color: '#3b82f6', glow: true },
    { id: 'fox', label: 'FOX', color: '#3b82f6', glow: true },
    { id: 'fox-pink', label: 'fox', color: '#ec4899', glow: true },
  ]

  const characterOptions = ['Pembe Tavşan', 'Robot', 'Uçan Ejderha', 'Büyücü', 'Astronot']
  const aspectOptions = ['16:9', '9:16', '1:1']

  const platformOptions = [
    { name: 'YouTube', icon: <Youtube className="w-3.5 h-3.5" />, color: '#FF0000' },
    { name: 'TikTok', icon: <Music className="w-3.5 h-3.5" />, color: '#00F2FE' },
    { name: 'Instagram', icon: <Instagram className="w-3.5 h-3.5" />, color: '#E1306C' },
    { name: 'X', icon: <XIcon />, color: '#FFFFFF' }
  ]

  const currentPlatform = platformOptions.find(p => p.name === config.platform) || platformOptions[0]
  const currentNarrator = narratorOptions.find(n => n.name === config.narrator) || narratorOptions[0]

  return (
    <>
      <motion.div ref={nodeRef} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className={`relative w-[340px] rounded-2xl border transition-all bg-[#0F051D] shadow-2xl z-[1000] ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'}`}
        style={{ borderColor: selected ? color : 'rgba(255,255,255,0.15)', boxShadow: selected ? `0 0 30px ${color}30` : undefined }}>

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-t-2xl bg-white/[0.02] border-b border-white/10">
          <FileText className="w-4 h-4 text-zinc-400" />
          <span className="flex-1 text-xs font-semibold text-white">Video brief 1</span>
          <button className="text-zinc-500 hover:text-white transition-colors"><Settings2 className="w-4 h-4" /></button>
        </div>

        <div className="p-4 space-y-5">

          {/* Key Elements */}
          <div>
            <h3 className="text-[11px] font-bold text-white mb-3 tracking-wide">Key elements</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 w-24">Visual style</span>
                <div className="flex-1 relative">
                  <button {...dropdownButtonProps('visualStyle')}>
                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                      <span className="text-sm">{styleOptions.find(s => s.label === config.visualStyle)?.emoji || '🎨'}</span>
                      <span className="text-[11px] font-bold text-white truncate">{config.visualStyle}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'visualStyle' && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-50 top-full mt-1 right-0 w-64 bg-[#1a0d2e] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 grid grid-cols-2 gap-2 origin-top-right">
                        {styleOptions.map(style => (
                          <button
                            key={style.id}
                            onClick={() => { updateNodeConfig(id, { visualStyle: style.label }); setOpenDropdown(null) }}
                            className={`flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl transition-all cursor-pointer ${config.visualStyle === style.label ? 'bg-white/10 border border-white/20' : 'bg-transparent border border-transparent hover:bg-white/5'}`}
                          >
                            <span className="text-lg">{style.emoji}</span>
                            <span className="text-[10px] font-medium text-zinc-300 text-center leading-tight">{style.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 w-24">Narrator</span>
                <div className="flex-1 relative">
                  <button {...dropdownButtonProps('narrator')}>
                    <div className="flex items-center gap-1.5">
                      <img src={currentNarrator.img} alt="" className="w-4 h-4 rounded-full object-cover" /> {config.narrator}
                    </div>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'narrator' && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-50 top-full mt-1 right-0 w-64 bg-[#1a0d2e] border border-white/10 rounded-xl shadow-2xl flex flex-col origin-top-right overflow-hidden">

                        <div className="p-3 bg-white/5 border-b border-white/10 space-y-3 shrink-0">
                          <div className="text-sm font-bold text-white">Narrator</div>
                          <div className="flex bg-black/40 p-1 rounded-lg">
                            <button onClick={() => setNarratorTab('Voice')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${narratorTab === 'Voice' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Voice</button>
                            <button onClick={() => setNarratorTab('Avatar')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${narratorTab === 'Avatar' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Avatar</button>
                          </div>
                        </div>

                        <div className="p-2 h-[260px] overflow-y-auto nowheel custom-scrollbar flex flex-col space-y-0.5">
                          {narratorOptions.map((opt) => {
                            const isSelected = config.narrator === opt.name;
                            return (
                              <div key={opt.name} className={`w-full flex items-center justify-between p-2 hover:bg-white/10 rounded-xl transition-colors group cursor-pointer ${isSelected ? 'bg-white/5' : ''}`} onClick={() => { updateNodeConfig(id, { narrator: opt.name }); setOpenDropdown(null); }}>

                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="relative shrink-0 w-10 h-10 rounded-full overflow-hidden border border-white/10 shadow-sm" onClick={(e) => playNarratorPreview(opt, e)}>
                                    <img src={opt.img} alt="" className="w-full h-full object-cover" />
                                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${playingPreview === opt.name ? 'bg-black/60 opacity-100' : 'bg-black/40 opacity-0 group-hover:opacity-100'}`}>
                                      {playingPreview === opt.name ? (
                                        <Square className="w-4 h-4 fill-white text-white" />
                                      ) : (
                                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-[12px] text-white font-bold truncate">{opt.name}</span>
                                </div>

                                {isSelected ? (
                                  <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] flex items-center justify-center mr-1">
                                    <Check className="w-3.5 h-3.5 text-white" />
                                  </div>
                                ) : (
                                  <div className="shrink-0 w-5 h-5 rounded-full border border-white/10 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                                    <Plus className="w-3.5 h-3.5 text-white/50 group-hover:text-white" />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <CharacterSection
                characterNames={config.character ? config.character.split(',').map(c => c.trim()).filter(Boolean) : []}
                characterImages={(config as any).characterImageUrls || {}}
                onUpload={(name, file) => {
                  const charImages = (config as any).characterImageUrls || {};
                  updateNodeConfig(id, { characterImageUrls: { ...charImages, [name]: URL.createObjectURL(file) } } as any);
                }}
                onGenerate={async (name) => {
                  try {
                    const charImages = (config as any).characterImageUrls || {};
                    const prompt = `${name}, ${config.visualStyle || 'cartoon 3D'} style, character portrait, white background, high quality`;
                    const res = await fetch('/api/generate/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'flux-schnell', prompt }) });
                    const d = await res.json();
                    if (d.imageUrl) {
                      updateNodeConfig(id, { characterImageUrls: { ...charImages, [name]: d.imageUrl } } as any);
                    }
                  } catch { toast.error('Character generation failed') }
                }}
                onAddCharacter={(name) => {
                  const newChar = config.character ? `${config.character}, ${name}` : name;
                  updateNodeConfig(id, { character: newChar } as any);
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 w-24">Music</span>
                <div className="flex-1 relative">
                  <button {...dropdownButtonProps('music')}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-[4px] bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                        <Music className="w-3 h-3" />
                      </div>
                      <span>{config.music === 'Deep background' ? 'Deep background...' : config.music}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'music' && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-50 top-full mt-1 right-0 w-64 bg-[#1a0d2e] border border-white/10 rounded-xl shadow-2xl p-1 origin-top-right flex flex-col max-h-[300px]">

                        <div className="px-2 py-2 mb-1 flex items-center gap-2 border-b border-white/10 shrink-0">
                          <Search className="w-3.5 h-3.5 text-zinc-400" />
                          <input type="text" placeholder="Search music" className="bg-transparent text-[11px] text-white outline-none w-full placeholder:text-zinc-500" />
                          <Filter className="w-3.5 h-3.5 text-zinc-400 cursor-pointer hover:text-white transition-colors" />
                        </div>

                        <div className="flex gap-1.5 px-2 pb-2 overflow-x-auto nowheel hide-scroll custom-scrollbar shrink-0 border-b border-white/5 mx-1 mb-1">
                          <span className="px-2 py-1 bg-white/10 text-white rounded-md text-[9px] font-medium whitespace-nowrap">background music</span>
                          <span className="px-2 py-1 bg-transparent text-zinc-400 hover:text-white rounded-md text-[9px] font-medium whitespace-nowrap border border-white/10 transition-colors cursor-pointer">phonk</span>
                          <span className="px-2 py-1 bg-transparent text-zinc-400 hover:text-white rounded-md text-[9px] font-medium whitespace-nowrap border border-white/10 transition-colors cursor-pointer">Happy</span>
                        </div>

                        <div className="flex-1 overflow-y-auto nowheel custom-scrollbar px-1 min-h-[140px]">
                          {musicOptions.map((opt, i) => {
                            const isSelected = config.music === opt.name;
                            const currentVolume = musicVolume[opt.name] ?? -18.4;
                            return (
                              <div key={i} className={`flex flex-col group p-1 ${isSelected ? 'bg-white/5 rounded-lg mb-1' : 'hover:bg-white/10 rounded-lg'}`}>
                                <div className="w-full flex items-center gap-2.5 px-1 py-1 cursor-pointer" onClick={() => updateNodeConfig(id, { music: opt.name })}>
                                  <div className="relative w-8 h-8 rounded border border-white/5 overflow-hidden shrink-0" style={{ backgroundColor: `${opt.color}20` }}>
                                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${playingPreview === opt.name ? 'opacity-0' : 'opacity-100'}`}>
                                      <Music className="w-4 h-4" style={{ color: opt.color }} />
                                    </div>
                                    <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${playingPreview === opt.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} onClick={(e) => playMusicPreview(opt.name, currentVolume, e)}>
                                      {playingPreview === opt.name ? (
                                        <Square className="w-3.5 h-3.5 fill-white text-white" />
                                      ) : (
                                        <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0 pr-1">
                                    <div className="text-[11px] text-zinc-200 font-semibold truncate mb-0.5">{opt.name}</div>
                                    <div className="text-[9px] text-zinc-500 font-medium truncate">{opt.duration} · {opt.author}</div>
                                  </div>
                                  <div className="shrink-0 w-8 flex justify-center">
                                    {isSelected ? (
                                      <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                      </div>
                                    ) : (
                                      <div className="shrink-0 w-7 h-7 rounded-full bg-transparent hover:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer" onClick={(e) => { e.stopPropagation(); updateNodeConfig(id, { music: opt.name }); }}>
                                        <Plus className="w-4 h-4 text-[#0ea5e9]" />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {isSelected && (
                                  <div className="mt-1.5 mb-1 px-2 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    <input type="range" min="-40" max="0" step="0.1" value={currentVolume} onChange={(e) => {
                                      const db = parseFloat(e.target.value)
                                      setMusicVolume(prev => ({ ...prev, [opt.name]: db }))
                                      if (playingPreview === opt.name && masterGainRef.current) {
                                        masterGainRef.current.gain.value = Math.pow(10, db / 20)
                                      }
                                    }} className="flex-1 h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-110 transition-all [&::-webkit-slider-thumb]:shadow-lg" />
                                    <span className="text-[8px] font-bold text-[#D1FE17] bg-white/5 px-1 py-0.5 rounded tabular-nums min-w-[28px] text-center">{currentVolume.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 w-24">Captions</span>
                <div className="flex-1 relative">
                  <button {...dropdownButtonProps('captions')}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-[4px] bg-black border border-white/10 flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-black pointer-events-none" style={{ background: 'linear-gradient(to right, #ffcc00, #ff6600)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TXT</span>
                      </div>
                      <span className="text-[11px] text-zinc-300">{captionStyles.find(c => c.id === config.captions)?.label || 'None'}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'captions' && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-50 top-full mt-1 right-0 w-56 bg-[#1a0d2e] border border-white/10 rounded-2xl shadow-2xl p-2 origin-top-right">
                        <div className="text-[11px] font-bold text-white mb-2 ml-1">Captions</div>
                        <div className="grid grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto nowheel custom-scrollbar p-1">
                          {captionStyles.map(opt => (
                            <button key={opt.id} onClick={() => { updateNodeConfig(id, { captions: opt.id }); setOpenDropdown(null) }} className={`aspect-square rounded-xl border flex items-center justify-center text-[7px] font-black uppercase transition-all overflow-hidden relative shadow-inner ${config.captions === opt.id ? 'border-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.3)] ring-1 ring-[#3b82f6]/50' : 'border-white/10 hover:border-white/30 bg-black/40'}`}>
                              {opt.type === 'none' ? (
                                <span className="text-zinc-500 text-lg">⊘</span>
                              ) : (
                                <span className="text-center px-1" style={{ color: opt.color, textShadow: opt.glow ? `0 0 6px ${opt.color}` : 'none' }}>{opt.label}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Toggles & Small Inputs */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-400 w-24">Scene media</span>
                <div className="flex-1 flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                  <button onClick={() => updateNodeConfig(id, { sceneMedia: 'Video clips' })} className={`flex-1 py-1 text-[10px] font-medium rounded-md transition-colors ${config.sceneMedia === 'Video clips' ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-zinc-400 hover:text-white'}`}>Video clips</button>
                  <button onClick={() => updateNodeConfig(id, { sceneMedia: 'Images' })} className={`flex-1 py-1 text-[10px] font-medium rounded-md transition-colors ${config.sceneMedia === 'Images' ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-zinc-400 hover:text-white'}`}>Images</button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 w-24">Duration</span>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={config.duration}
                    onChange={(e) => updateNodeConfig(id, { duration: e.target.value })}
                    className="w-12 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none focus:border-white/30"
                  />
                  <span className="text-[11px] text-zinc-500">s</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 w-24">Aspect ratio</span>
                <div className="flex-1 relative">
                  <button {...dropdownButtonProps('aspect')}>
                    <div className="flex items-center gap-1.5">
                      <MonitorPlay className="w-3.5 h-3.5 text-zinc-400" /> {config.aspect}
                    </div>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'aspect' && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-full mt-1 right-0 w-32 bg-[#1a0d2e] border border-white/10 rounded-xl shadow-2xl z-50 p-1">
                        {aspectOptions.map(opt => (
                          <button key={opt} onClick={() => { updateNodeConfig(id, { aspect: opt }); setOpenDropdown(null) }} className="w-full text-left px-3 py-1.5 text-[11px] text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg">{opt}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 w-24">Platform</span>
                <div className="flex-1 relative">
                  <button {...dropdownButtonProps('platform')}>
                    <div className="flex items-center gap-1.5" style={{ color: currentPlatform.color }}>
                      {currentPlatform.icon} <span className="text-white">{config.platform}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'platform' && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-full mt-1 right-0 w-32 bg-[#1a0d2e] border border-white/10 rounded-xl shadow-2xl z-50 p-1">
                        {platformOptions.map(opt => (
                          <button key={opt.name} onClick={() => { updateNodeConfig(id, { platform: opt.name }); setOpenDropdown(null) }} className="w-full text-left px-3 py-1.5 text-[11px] text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2">
                            <span style={{ color: opt.color }}>{opt.icon}</span> {opt.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Outline / Script Area */}
          <div>
            <h3 className="text-[11px] font-bold text-white mb-2 tracking-wide">Outline / Narrative</h3>
            <textarea
              value={config.prompt}
              onChange={(e) => updateNodeConfig(id, { prompt: e.target.value })}
              placeholder="Describe your story here..."
              className="w-full h-[140px] bg-white/[0.03] border border-white/10 rounded-xl p-3 text-[11px] text-zinc-300 resize-none outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 custom-scrollbar transition-all leading-relaxed"
            />
          </div>

          {/* Generate Button Layer */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#D1FE17] bg-[#D1FE17]/10 px-2 py-1 rounded-md border border-[#D1FE17]/20">
              <Zap className="w-3 h-3" />
              <span>Cost: 50 Credits</span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !config.prompt.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-[11px] font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:shadow-none"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isGenerating ? 'Generating Scenes...' : 'Generate Node'}
            </button>
          </div>

        </div>

        {/* Output Handle */}
        <Handle type="source" position={Position.Right} id="brief-out"
          className="!w-4 !h-4 !rounded-full !border-4 !border-[#0F051D]" style={{ backgroundColor: color }} />
      </motion.div>
    </>
  )
})
VideoBriefNodeContent.displayName = 'VideoBriefNode'


// ── Film Strip Node (Right Panel in Screenshot) ────────────────────────────────────

export const FilmStripNodeContent = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const color = '#f59e0b' // Amber
  const [activeScene, setActiveScene] = useState(0)
  const [hoveredScene, setHoveredScene] = useState<number | null>(null)
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false)
  
  // Panel and Modal States
  const [showMusicPanel, setShowMusicPanel] = useState(false)
  const [showElementsPanel, setShowElementsPanel] = useState(false)
  const [showNarratorDropdown, setShowNarratorDropdown] = useState<number | null>(null)
  const [narratorTab, setNarratorTab] = useState<'voice' | 'avatar'>('voice')
  
  const [showMediaModal, setShowMediaModal] = useState<number | null>(null)
  const [showTrimModal, setShowTrimModal] = useState<number | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showAvatarPreview, setShowAvatarPreview] = useState(false)
  const [showAvatarEdit, setShowAvatarEdit] = useState(false)

  const updateNodeConfig = useWorkspaceStore((s) => s.updateNodeConfig)

  const config = (data.config as FilmStripConfig) || { scenes: [] }
  const scenes = config.scenes || []

  // Safe fallback if scenes array is empty
  const currentScene = scenes[activeScene] || null
  const currentNarrator = narratorOptions.find(n => n.voiceId === (config.narratorVoiceId || 'alloy')) || narratorOptions[0]

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0, x: -20 }} animate={{ scale: 1, opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative flex w-[800px] h-[500px] rounded-2xl border transition-all bg-[#0F051D] shadow-2xl ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'}`}
      style={{ borderColor: selected ? color : 'rgba(255,255,255,0.15)', boxShadow: selected ? `0 0 30px ${color}30` : undefined }}>

      {/* Target Handle */}
      <Handle type="target" position={Position.Left} id="film-in"
        className="!w-4 !h-4 !rounded-full !border-2 !border-[#1a0d2e] shadow-sm z-[150]" style={{ backgroundColor: color, left: '-8px' }} />

      {/* Source/Output Handles */}
      <Handle type="source" position={Position.Right} id="video-out"
        className="!w-4 !h-4 !rounded-full !border-2 !border-[#1a0d2e] shadow-sm z-[150] hover:scale-125 transition-transform cursor-crosshair" style={{ backgroundColor: '#D1FE17', top: '40%', right: '-8px' }} />
      <div className="absolute -right-[60px] top-[calc(40%-10px)] text-[9px] font-bold text-[#D1FE17] tracking-wider uppercase bg-[#0F051D] px-1.5 py-0.5 rounded border border-[#D1FE17]/30 shadow-lg whitespace-nowrap z-40 pointer-events-none">Video ➔</div>

      <Handle type="source" position={Position.Right} id="image-out"
        className="!w-4 !h-4 !rounded-full !border-2 !border-[#1a0d2e] shadow-sm z-[150] hover:scale-125 transition-transform cursor-crosshair" style={{ backgroundColor: '#FFE744', top: '60%', right: '-8px' }} />
      <div className="absolute -right-[66px] top-[calc(60%-10px)] text-[9px] font-bold text-[#FFE744] tracking-wider uppercase bg-[#0F051D] px-1.5 py-0.5 rounded border border-[#FFE744]/30 shadow-lg whitespace-nowrap z-40 pointer-events-none">Images ➔</div>


      {/* Left Pane: Scenes List */}
      <div className="w-[350px] flex flex-col border-r border-white/10 bg-white/[0.02] rounded-l-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#0F051D]">
          <Film className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-semibold text-white">{data.label || 'Film Strip'}</span>
        </div>

        {/* Generation progress bar */}
        {(config.generationPhase === 'tts' || config.generationPhase === 'images') && (
          <div className="px-4 py-2.5 bg-[#1a0d2e] border-b border-white/10 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-zinc-300 font-medium">
                {config.generationPhase === 'tts' ? '🎙 Generating audio...' : '🖼 Generating visuals...'}
              </span>
              <span className="text-[10px] text-[#D1FE17] font-bold">{config.generationProgress ?? 0}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${config.generationProgress ?? 0}%`, background: config.generationPhase === 'tts' ? '#a78bfa' : '#D1FE17' }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {scenes.map((scene, i) => (
            <div
              key={scene.id || i}
              onClick={() => setActiveScene(i)}
              onMouseEnter={() => setHoveredScene(i)}
              onMouseLeave={() => setHoveredScene(null)}
              className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all border ${activeScene === i ? 'bg-[#00B5CF]/10 border-[#00B5CF]/40' : 'bg-[#1a0d2e] border-white/5 hover:border-white/15'}`}
            >
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-1.5 relative">
                  <span className="text-[10px] text-zinc-500 font-medium tabular-nums">00:{String(scene.duration || 5).padStart(2, '0')}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowNarratorDropdown(showNarratorDropdown === i ? null : i) }}
                    className="flex items-center gap-1 text-[9px] text-[#00B5CF] bg-[#00B5CF]/10 hover:bg-[#00B5CF]/20 px-1.5 py-0.5 rounded transition-colors border border-[#00B5CF]/20">
                    <img src={currentNarrator.img} alt="" className="w-3 h-3 rounded-full object-cover" /> <span>{currentNarrator.name}</span>
                  </button>
                  
                  {/* Narrator Popover Anchor */}
                  {showNarratorDropdown === i && (
                    <div className="absolute top-full left-10 mt-1 w-64 bg-[#1a0d2e] border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden" onClick={e => e.stopPropagation()}>
                      <div className="flex p-1 border-b border-white/10 bg-white/5">
                        <button onClick={() => setNarratorTab('voice')} className={`flex-1 text-[10px] py-1.5 rounded-lg transition-colors ${narratorTab === 'voice' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'}`}>Voice</button>
                        <button onClick={() => setNarratorTab('avatar')} className={`flex-1 text-[10px] py-1.5 rounded-lg transition-colors ${narratorTab === 'avatar' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'}`}>Avatar</button>
                      </div>
                      <div className="p-2">
                        {narratorTab === 'voice' ? (
                          <div className="space-y-2">
                             <div className="p-3 bg-white/5 opacity-50 cursor-not-allowed rounded-lg border border-dashed border-white/20 text-center transition-colors">
                               <p className="text-[10px] text-zinc-400 mb-1">Create your custom voices.</p>
                               <span className="text-[10px] text-zinc-500 font-medium font-sans">Coming soon</span>
                             </div>
                             <div className="flex gap-2 px-1 mb-1 border-b border-white/5 pb-1">
                               <span className="text-[9px] text-[#00B5CF] font-medium border-b border-[#00B5CF] pb-0.5 cursor-pointer">Favorites</span>
                               <span className="text-[9px] text-zinc-600 cursor-not-allowed font-medium" title="Coming soon">Trending</span>
                             </div>
                             <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                               {narratorOptions.map(n => (
                                 <div key={n.voiceId} className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded cursor-pointer transition-colors" onClick={() => { updateNodeConfig(id, { narratorVoiceId: n.voiceId } as any); }}>
                                   <div className="relative">
                                     <img src={n.img} className="w-6 h-6 rounded-full object-cover shadow-md" />
                                     {config.narratorVoiceId === n.voiceId && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#1a0d2e]"><Check className="w-2 h-2 text-white shadow-sm" /></div>}
                                   </div>
                                   <span className={`text-[10px] flex-1 ${config.narratorVoiceId === n.voiceId ? 'text-[#00B5CF] font-bold' : 'text-white'}`}>{n.name}</span>
                                 </div>
                               ))}
                             </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-1 p-1 max-h-40 overflow-y-auto custom-scrollbar">
                             {narratorOptions.map((n, idx) => (
                               <div key={idx} className="aspect-square rounded border border-white/10 overflow-hidden relative group cursor-pointer" onClick={() => { setShowNarratorDropdown(null); setShowAvatarPreview(true); }}>
                                 <img src={n.img} className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                                    <button className="p-1 bg-white/20 rounded hover:bg-white/40"><Maximize2 className="w-3 h-3 text-white" /></button>
                                 </div>
                               </div>
                             ))}
                          </div>
                        )}
                        <button onClick={() => setShowNarratorDropdown(null)} className="w-full mt-2 py-1.5 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5"><Check className="w-3 h-3"/> Apply to all scenes</button>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-zinc-300 leading-relaxed line-clamp-3 w-[90%]">{scene.script || scene.description}</p>
              </div>

              <div className="w-[84px] h-[48px] rounded-md overflow-hidden bg-black/60 flex-shrink-0 relative border border-white/10 flex items-center justify-center">
                {scene.imageUrl ? (
                  <img src={scene.imageUrl} alt={`Scene ${i + 1}`} className="w-full h-full object-cover opacity-80" />
                ) : scene.status === 'generating' ? (
                  <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                ) : scene.status === 'done' ? (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 border border-green-500/50">
                    <Check className="w-3 h-3 text-green-400" />
                  </span>
                ) : scene.status === 'error' ? (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 border border-red-500/50">
                    <Square className="w-3 h-3 text-red-400" />
                  </span>
                ) : (
                  <ImageIcon className="w-4 h-4 text-white/20" />
                )}
                {hoveredScene === i && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center gap-1 z-10">
                    <button onClick={(e) => { e.stopPropagation(); setShowMediaModal(i); }} className="p-1.5 hover:bg-white/20 rounded-md text-white transition-colors" title="Replace"><RefreshCw className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setShowTrimModal(i); }} className="p-1.5 hover:bg-white/20 rounded-md text-white transition-colors" title="Trim"><Scissors className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 hover:bg-white/20 rounded-md text-red-400 transition-colors" title="Delete"><Trash className="w-3 h-3" /></button>
                  </div>
                )}
                <div className="absolute bottom-1 right-1 text-[8px] bg-black/60 px-1 rounded text-white font-medium z-0">00:{String(scene.duration || 5).padStart(2, '0')}</div>
              </div>
            </div>
          ))}
          {scenes.length === 0 && (
            <div className="p-4 text-center text-xs text-zinc-500">No scenes generated yet.</div>
          )}
        </div>
      </div>

      {/* Right Pane: Video Preview */}
      <div className="flex-1 flex flex-col p-6 bg-[#0F051D] rounded-r-2xl relative">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button onClick={() => setShowExportModal(true)} className="px-3 py-1.5 bg-[#00B5CF] hover:bg-[#009ab0] text-black font-semibold text-[10px] rounded-lg transition-colors flex items-center gap-1"><Download className="w-3 h-3" /> Export</button>
            <button className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-[10px] rounded-lg transition-colors border border-white/5">Edit more</button>
          </div>
          <div className="flex justify-end gap-2 relative">
            <div className="relative">
              <button
                onClick={() => { setShowMusicPanel(v => !v); setShowElementsPanel(false) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[10px] text-white transition-colors ${showMusicPanel ? 'bg-white/15 border-white/30' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
              >
                <Music className="w-3.5 h-3.5 text-zinc-400" />
                Add music
              </button>
              {showMusicPanel && (
                <div className="absolute z-50 top-full mt-1 right-0 w-80 bg-[#1a0d2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden p-2 flex flex-col gap-2 cursor-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex gap-2 p-1 border-b border-white/10">
                    <span className="text-[10px] text-white font-bold border-b border-white pb-1">Music</span>
                    <span className="text-[10px] text-zinc-500 hover:text-white transition-colors cursor-pointer">Sound effects</span>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input type="text" placeholder="Search music or artist..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#00B5CF] transition-colors" />
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                    {['Happy', 'TikTok', 'Piano', 'Action', 'Pop', 'Vlog'].map(t => (
                       <button key={t} className="px-2.5 py-1 bg-white/5 hover:bg-white/15 rounded-full text-[9px] text-zinc-300 border border-white/10 shrink-0 transition-colors">{t}</button>
                    ))}
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar mt-1">
                    {[
                      {name: 'Upbeat Pop Energy', artist: 'Sunny Breaks', time: '02:14'},
                      {name: 'Cinematic Intro', artist: 'Hans Zimmer Clone', time: '01:05'},
                      {name: 'LoFi Study Vibe', artist: 'Chill Beats', time: '03:45'},
                      {name: 'Deep background', artist: 'Ambient Sounds', time: '05:30'},
                      {name: 'Orchestral Sweep', artist: 'Epic Music', time: '02:20'}
                    ].map(m => (
                      <div key={m.name} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors group ${(config as any).music === m.name ? 'bg-white/10' : 'hover:bg-white/5'}`} onClick={() => { updateNodeConfig(id, { music: m.name } as any); setShowMusicPanel(false) }}>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="w-8 h-8 rounded shrink-0 bg-white/5 flex items-center justify-center relative border border-white/10">
                            <Music className="w-3.5 h-3.5 text-zinc-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Play className="w-3 h-3 text-white fill-current" /></div>
                          </div>
                          <div className="flex flex-col overflow-hidden">
                             <span className={`text-[10px] font-medium truncate ${(config as any).music === m.name ? 'text-[#00B5CF]' : 'text-white'}`}>{m.name}</span>
                             <span className="text-[9px] text-zinc-500 truncate">{m.artist}</span>
                          </div>
                        </div>
                        <div className="text-[9px] text-zinc-600 tabular-nums">{m.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => { setShowElementsPanel(v => !v); setShowMusicPanel(false) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[10px] text-white transition-colors ${showElementsPanel ? 'bg-white/15 border-white/30' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
              >
                <Check className="w-3 h-3 text-[#00B5CF]" /> Elements
              </button>
              {showElementsPanel && (
                <div className="absolute z-50 top-full mt-1 right-0 w-64 bg-[#1a0d2e] border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-2 cursor-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex gap-2 p-1 border-b border-white/10">
                    <span className="text-[10px] text-white font-bold border-b border-white pb-1">Text</span>
                    <span className="text-[10px] text-zinc-500 hover:text-white transition-colors cursor-pointer">Smart edit...</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                    <span className="text-[10px] text-zinc-300 font-medium">Auto Captions</span>
                    <div className="w-7 h-4 bg-[#00B5CF] rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" /></div>
                  </div>
                  <p className="text-[8px] text-zinc-500 px-1 mt-1">Caption template</p>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                     <div className="h-16 rounded-lg bg-white/5 border-2 border-[#00B5CF] flex items-center justify-center relative cursor-pointer hover:bg-white/10 transition-all hover:scale-105 group overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div><span className="text-[14px] font-black text-white italic z-10 drop-shadow-[2px_2px_0_rgba(255,0,0,1)] group-hover:animate-pulse">VLOG</span><Check className="absolute top-1 right-1 w-3 h-3 text-[#00B5CF] z-20"/></div>
                     <div className="h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center relative cursor-pointer hover:bg-white/10 transition-all hover:scale-105 group"><span className="text-[12px] font-bold text-yellow-400 uppercase bg-black/40 px-1 rounded transform group-hover:-rotate-3 group-hover:scale-110 transition-transform">Karaoke</span></div>
                     <div className="h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center relative cursor-pointer hover:bg-white/10 transition-all hover:scale-105 group overflow-hidden"><div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"></div><span className="text-[12px] font-serif text-white/90 z-10 group-hover:tracking-[0.2em] transition-all duration-500">Cinematic</span></div>
                     <div className="h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center relative cursor-pointer hover:bg-white/10 transition-all hover:scale-105 group max-w-full overflow-hidden"><span className="text-[13px] font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 relative group-hover:animate-bounce">TikTok<span className="absolute inset-0 text-white mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity blur-[1px]">TikTok</span></span></div>
                  </div>
                  <button onClick={() => setShowElementsPanel(false)} className="w-full mt-2 py-1.5 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-zinc-200 transition-colors">Apply</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Player Box */}
        <div className="flex-1 bg-black/40 rounded-xl border border-white/15 overflow-hidden relative shadow-2xl flex flex-col items-center justify-center">
          <div className="flex-1 w-full relative flex items-center justify-center">
            {currentScene?.videoUrl ? (
              <video src={currentScene.videoUrl} autoPlay loop controls className="w-full h-full object-contain" />
            ) : currentScene?.imageUrl ? (
              <img src={currentScene.imageUrl} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/20">
                <ImageIcon className="w-8 h-8" />
                <p className="text-xs">No media generated yet</p>
              </div>
            )}

            {/* Fake Captions Overlay */}
            {currentScene?.videoUrl && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
                <span className="bg-amber-400 text-black font-black uppercase px-2 py-0.5 rounded shadow-lg text-sm tracking-widest" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  {currentScene.script?.substring(0, 15)}...
                </span>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="h-12 bg-[#1a0d2e] border-t border-white/10 flex items-center px-4 gap-3">
            <button className="text-white hover:text-[#f59e0b] transition-colors"><Play className="w-4 h-4 fill-current" /></button>
            <span className="text-[10px] text-zinc-400 font-medium tabular-nums ml-2">00:00:00 <span className="text-zinc-600 mx-1">|</span> 00:00:15</span>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
              <MonitorPlay className="w-3.5 h-3.5" /> 16:9
            </div>
          </div>
        </div>

        {/* Per-scene download links */}
        {currentScene && (
          <div className="flex items-center gap-2 mt-2">
            {currentScene.imageUrl && (
              <a href={currentScene.imageUrl} target="_blank" rel="noopener noreferrer" download={`scene-${activeScene + 1}.jpg`}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-zinc-300 flex items-center gap-1.5 transition-colors">
                ⬇ Image
              </a>
            )}
            {currentScene.audioUrl && (
              <a href={currentScene.audioUrl} download={`scene-${activeScene + 1}-voice.mp3`}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-zinc-300 flex items-center gap-1.5 transition-colors">
                ⬇ Voice
              </a>
            )}
            {currentScene.videoUrl && (
              <a href={currentScene.videoUrl} target="_blank" rel="noopener noreferrer" download={`scene-${activeScene + 1}-video.mp4`}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-zinc-300 flex items-center gap-1.5 transition-colors">
                ⬇ Video
              </a>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            disabled={isGeneratingMedia || scenes.length === 0}
            className="px-5 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-300 transition-colors disabled:opacity-50 flex items-center gap-2"
            onClick={async () => {
              setIsGeneratingMedia(true)
              const updatedScenes = [...scenes]
              for (let i = 0; i < updatedScenes.length; i++) {
                const s = updatedScenes[i]
                if (s.videoUrl) continue
                const videoModel = s.imageUrl ? 'kling-3.0-standard-i2v' : 'kling-3.0-standard-t2v'
                const toastId = toast.loading(`Scene ${i + 1}: Generating video...`)
                try {
                  const r = await fetch('/api/generate/video', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: videoModel, prompt: s.description, imageUrl: s.imageUrl || undefined, duration: s.duration || 5 }),
                  })
                  const d = await r.json()
                  if (d.videoUrl) {
                    updatedScenes[i] = { ...s, videoUrl: d.videoUrl }
                    updateNodeConfig(id, { scenes: [...updatedScenes] })
                    toast.success(`Scene ${i + 1} video done`, { id: toastId })
                  } else {
                    toast.error(`Scene ${i + 1}: ${d.error || 'failed'}`, { id: toastId })
                  }
                } catch (e: any) {
                  toast.error(`Scene ${i + 1}: ${e.message}`, { id: toastId })
                }
              }
              setIsGeneratingMedia(false)
            }}
          >
            {isGeneratingMedia ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><MonitorPlay className="w-3.5 h-3.5" /> Generate Videos</>}
          </button>
        </div>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {/* YZ Medya (Media Edit) Modal */}
        {showMediaModal !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[200] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="w-full max-w-4xl h-full bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
              <div className="flex items-center justify-between p-4 border-b border-zinc-100">
                 <div className="flex gap-6 px-4">
                   <button className="text-sm font-bold text-zinc-400 hover:text-black">Your media</button>
                   <button className="text-sm font-bold text-zinc-400 hover:text-black">Stock media</button>
                   <button className="text-sm font-bold text-black border-b-2 border-black pb-1">AI media</button>
                 </div>
                 <button onClick={() => setShowMediaModal(null)} className="p-2 hover:bg-zinc-100 rounded-full"><X className="w-5 h-5 text-zinc-500" /></button>
              </div>
              <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Left controls - Replaced flex-col with block to fix scrolling issues in deeply nested areas */}
                <div className="w-1/3 border-r border-zinc-100 p-6 overflow-y-auto custom-scrollbar space-y-6 block pb-12">
                   <div>
                     <label className="text-xs font-bold text-zinc-800 mb-2 block">Prompt</label>
                     <textarea readOnly value={scenes[showMediaModal]?.script || scenes[showMediaModal]?.description} className="w-full h-32 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-[11px] text-zinc-600 resize-none shadow-inner" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-zinc-800 mb-2 block">Style</label>
                     <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                       <div className="w-16 shrink-0 aspect-[3/4] rounded-lg bg-zinc-200 border-2 border-[#00B5CF] relative overflow-hidden"><img src="https://picsum.photos/100" className="w-full h-full object-cover"/><div className="absolute inset-x-0 bottom-0 bg-black/50 text-[8px] text-white text-center py-0.5">Realistic Film</div></div>
                       <div className="w-16 shrink-0 aspect-[3/4] rounded-lg bg-zinc-200 relative overflow-hidden border border-zinc-200 cursor-pointer hover:scale-105 transition-transform"><img src="https://picsum.photos/101" className="w-full h-full object-cover"/><div className="absolute inset-x-0 bottom-0 bg-black/50 text-[8px] text-white text-center py-0.5">Cartoon 3D</div></div>
                     </div>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-zinc-800 mb-2 block">Scene media</label>
                     <div className="flex gap-2">
                       <button className="flex-1 py-2 text-[10px] font-semibold border border-[#00B5CF] text-[#00B5CF] bg-[#00B5CF]/10 rounded-xl flex items-center justify-center gap-1 shadow-sm"><ImageIcon className="w-3 h-3"/> Images</button>
                       <button className="flex-1 py-2 text-[10px] font-semibold border border-zinc-200 text-zinc-500 hover:text-zinc-700 bg-white hover:bg-zinc-50 rounded-xl flex items-center justify-center gap-1 shadow-sm transition-colors"><MonitorPlay className="w-3 h-3"/> Video clips</button>
                     </div>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-zinc-800 mb-2 block">Aspect ratio</label>
                     <div className="flex gap-2">
                       <button className="flex-1 py-2 text-[10px] font-semibold border border-[#00B5CF] text-[#00B5CF] bg-[#00B5CF]/10 rounded-xl flex items-center justify-center gap-1 shadow-sm"><MonitorPlay className="w-3 h-3"/> 16:9</button>
                       <button className="flex-1 py-2 text-[10px] font-semibold border border-zinc-200 text-zinc-500 hover:text-zinc-700 bg-white hover:bg-zinc-50 rounded-xl flex items-center justify-center gap-1 shadow-sm transition-colors"><MonitorPlay className="w-3 h-3"/> 9:16</button>
                     </div>
                   </div>
                   <div className="pt-4">
                     <button className="w-full py-3 bg-[#00B5CF] hover:bg-[#009ab0] text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">Generate</button>
                   </div>
                </div>
                {/* Right preview */}
                <div className="flex-1 bg-zinc-50 p-6 flex flex-col justify-center items-center relative">
                   <div className="absolute top-4 right-4 bg-black/50 text-white text-[9px] px-2 py-1 rounded">Added</div>
                   <div className="w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-xl aspect-video relative flex items-center justify-center">
                     {scenes[showMediaModal]?.imageUrl ? <img src={scenes[showMediaModal].imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 text-zinc-600"/>}
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Trim (Kes) Modal */}
        {showTrimModal !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[200] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 flex flex-col relative">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-black text-sm">Trim</h3>
                 <button onClick={() => setShowTrimModal(null)} className="p-1 hover:bg-zinc-100 rounded-full"><X className="w-4 h-4 text-zinc-500" /></button>
               </div>
               <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-6 flex items-center justify-center shadow-inner">
                 {scenes[showTrimModal]?.videoUrl ? <video src={scenes[showTrimModal].videoUrl} className="w-full h-full object-contain" controls /> : scenes[showTrimModal]?.imageUrl ? <img src={scenes[showTrimModal].imageUrl} className="w-full h-full object-contain"/> : <ImageIcon className="w-8 h-8 text-zinc-600"/>}
               </div>
               <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-2 px-1">
                 <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-[10px] text-[#00B5CF]"/> Depending on voiceover duration, trim video up to 3.0 seconds for best results.</div>
                 <div className="flex items-center gap-1"><Check className="w-3 h-3 text-white bg-[#00B5CF] rounded-full p-0.5"/> Auto trim</div>
               </div>
               <div className="h-12 bg-zinc-200 rounded-lg overflow-hidden border-2 border-[#00B5CF] relative cursor-pointer">
                 {Array.from({length: 10}).map((_, i) => <img key={i} src={scenes[showTrimModal]?.imageUrl || 'https://picsum.photos/100'} className="h-full w-[10%] object-cover inline-block border-r border-black/20"/>)}
                 <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#00B5CF] cursor-ew-resize"/>
                 <div className="absolute right-0 top-0 bottom-0 w-2 bg-[#00B5CF] cursor-ew-resize"/>
               </div>
               <div className="mt-6 flex justify-end">
                 <button onClick={() => setShowTrimModal(null)} className="px-6 py-2 bg-[#00B5CF] text-white font-bold rounded-xl text-xs hover:bg-[#009ab0]">Done</button>
               </div>
            </div>
          </motion.div>
        )}

        {/* Export (Dışa aktar) Modal */}
        {showExportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute z-[200] top-12 right-6 w-72 bg-white rounded-3xl shadow-2xl p-5 border border-zinc-100">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-black text-sm">Export</h3>
               <button onClick={() => setShowExportModal(false)} className="text-zinc-500 hover:text-black transition-colors"><X className="w-4 h-4"/></button>
             </div>
             <div className="space-y-4">
               <div>
                 <label className="text-[10px] text-zinc-500 mb-1 block">File name</label>
                 <input type="text" defaultValue="Why your dog never trusts by accident" className="w-full bg-zinc-100 rounded-lg p-2.5 text-[11px] text-zinc-800 px-3 outline-none" />
               </div>
               <div>
                 <label className="text-[10px] text-zinc-500 mb-1 block">Quality</label>
                 <div className="w-full bg-zinc-100 rounded-lg p-2.5 text-[11px] text-zinc-800 flex justify-between items-center cursor-pointer">High <ChevronDown className="w-3 h-3"/></div>
               </div>
               <div>
                 <label className="text-[10px] text-zinc-500 mb-1 block">Resolution</label>
                 <div className="w-full bg-zinc-100 rounded-lg p-2.5 text-[11px] text-zinc-800 flex justify-between items-center cursor-pointer">2k <ChevronDown className="w-3 h-3"/></div>
               </div>
               <div>
                 <label className="text-[10px] text-zinc-500 mb-1 block">Format</label>
                 <div className="w-full bg-zinc-100 rounded-lg p-2.5 text-[11px] text-zinc-800 flex justify-between items-center cursor-pointer">mp4 <ChevronDown className="w-3 h-3"/></div>
               </div>
               <div>
                 <label className="text-[10px] text-zinc-500 mb-1 block">Framerate</label>
                 <div className="w-full bg-zinc-100 rounded-lg p-2.5 text-[11px] text-zinc-800 flex justify-between items-center cursor-pointer">25fps <ChevronDown className="w-3 h-3"/></div>
               </div>
               <button onClick={() => setShowExportModal(false)} className="w-full mt-2 py-3 bg-[#00B5CF] text-white font-bold rounded-xl text-xs hover:bg-[#009ab0] transition-colors">Export</button>
             </div>
          </motion.div>
        )}

        {/* Avatar Preview Modal */}
        {showAvatarPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute z-[200] inset-4 bg-black rounded-3xl overflow-hidden flex flex-col pt-4 shadow-2xl">
             <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button onClick={() => { setShowAvatarPreview(false); setShowAvatarEdit(true); }} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white text-[10px] font-bold transition-colors"><Edit2 className="w-3 h-3 inline-block mr-1"/> Edit</button>
                <button onClick={() => setShowAvatarPreview(false)} className="p-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors"><X className="w-4 h-4"/></button>
             </div>
             <img src={currentNarrator.img} className="w-full h-full object-cover" />
             <div className="absolute bottom-6 inset-x-6">
                <button onClick={() => setShowAvatarPreview(false)} className="w-full py-3 bg-[#00B5CF] hover:bg-[#009ab0] text-black font-bold rounded-xl text-sm shadow-xl transition-colors">Apply</button>
             </div>
          </motion.div>
        )}

        {/* Avatar Edit Modal overlay */}
        {showAvatarEdit && (
           <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="absolute inset-0 top-1/2 z-[210] bg-[#1a0d2e] rounded-t-3xl p-6 border-t border-white/10 flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-white font-bold text-sm">Edit Avatar</h3>
                 <button onClick={() => setShowAvatarEdit(false)} className="text-zinc-500 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
              </div>
               
              <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                <div>
                  <label className="text-[10px] text-zinc-400 mb-2 block">Select voice</label>
                  <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors">
                     <div className="flex items-center gap-2">
                       <img src={currentNarrator.img} className="w-6 h-6 rounded-full"/>
                       <span className="text-xs text-white font-medium">{currentNarrator.name}</span>
                     </div>
                     <ChevronDown className="w-4 h-4 text-zinc-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                   <div>
                     <span className="text-xs font-bold text-white block">Remove background</span>
                     <span className="text-[10px] text-zinc-500">Transparent background for video</span>
                   </div>
                   <div className="w-9 h-5 bg-[#00B5CF] rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" /></div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                 <button onClick={() => setShowAvatarEdit(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs transition-colors border border-white/10">Cancel</button>
                 <button onClick={() => setShowAvatarEdit(false)} className="flex-1 py-3 bg-[#00B5CF] hover:bg-[#009ab0] text-black font-bold rounded-xl text-xs transition-colors border border-[#00B5CF]">Save</button>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
})
FilmStripNodeContent.displayName = 'FilmStripNode'

