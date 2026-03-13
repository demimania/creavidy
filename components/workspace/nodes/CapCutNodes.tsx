'use client'

import { memo, useState, useEffect, useRef } from 'react'
import { Handle, Position, type NodeProps, useReactFlow } from 'reactflow'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Play, Loader2, ChevronDown, Check, Settings2, Image as ImageIcon, MonitorPlay, Film, Zap, Music, RefreshCw, Youtube, Instagram, Search, Filter, SlidersHorizontal, Plus, Square, Scissors, Trash, Download, Volume2, Edit2, Heart, TrendingUp, Maximize2, MoreHorizontal, X, ArrowLeft, Upload
} from 'lucide-react'
import { useWorkspaceStore, type NodeData, type VideoBriefConfig, type FilmStripConfig } from '@/lib/stores/workspace-store'
import { toast } from 'sonner'

const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>
)

// Shared narrator options — module scope so both nodes can use them
type NarratorCategory = 'trending' | 'narration' | 'female' | 'male' | 'character'
interface NarratorOption {
  name: string; voiceId: string; img: string; pitch: number; rate: number; text: string; emoji: string; categories: NarratorCategory[]
}
const narratorOptions: NarratorOption[] = [
  { name: 'Ms. Labebe', voiceId: 'fable', img: 'https://randomuser.me/api/portraits/women/68.jpg', pitch: 1.4, rate: 0.95, text: "Hello! I'm Ms. Labebe.", emoji: '👩', categories: ['trending', 'female'] },
  { name: 'Lady Holiday', voiceId: 'nova', img: 'https://randomuser.me/api/portraits/women/12.jpg', pitch: 1.1, rate: 0.9, text: "Welcome. I'm Lady Holiday.", emoji: '👩', categories: ['trending', 'female', 'narration'] },
  { name: 'Happy Dino', voiceId: 'echo', img: 'https://randomuser.me/api/portraits/men/32.jpg', pitch: 0.85, rate: 1.05, text: "Happy Dino here!", emoji: '🦕', categories: ['trending', 'character'] },
  { name: 'Jolly Yapper', voiceId: 'alloy', img: 'https://randomuser.me/api/portraits/women/44.jpg', pitch: 1.2, rate: 1.1, text: "Hey there! I'm Jolly Yapper!", emoji: '🎤', categories: ['trending', 'female'] },
  { name: 'Game Host', voiceId: 'alloy', img: 'https://randomuser.me/api/portraits/men/45.jpg', pitch: 1.0, rate: 1.15, text: "Welcome to the show!", emoji: '🎙️', categories: ['trending', 'male'] },
  { name: 'Calm Narrator', voiceId: 'onyx', img: 'https://randomuser.me/api/portraits/men/55.jpg', pitch: 0.9, rate: 0.85, text: "Let me tell you a story.", emoji: '🎭', categories: ['narration', 'male'] },
  { name: 'Cheerful Girl', voiceId: 'shimmer', img: 'https://randomuser.me/api/portraits/women/22.jpg', pitch: 1.3, rate: 1.1, text: "This is so exciting!", emoji: '😊', categories: ['trending', 'female'] },
  { name: 'Quiet Man', voiceId: 'onyx', img: 'https://randomuser.me/api/portraits/men/61.jpg', pitch: 0.8, rate: 0.8, text: "Sometimes silence speaks volumes.", emoji: '😐', categories: ['narration', 'male'] },
  { name: 'Brave Guy', voiceId: 'echo', img: 'https://randomuser.me/api/portraits/men/71.jpg', pitch: 0.9, rate: 1.0, text: "Let's conquer this!", emoji: '💪', categories: ['male'] },
  { name: 'ASMR Vlogger', voiceId: 'shimmer', img: 'https://randomuser.me/api/portraits/women/35.jpg', pitch: 1.05, rate: 0.75, text: "Hey... let me show you something.", emoji: '🎧', categories: ['female', 'narration'] },
  { name: 'Snarky Critic', voiceId: 'fable', img: 'https://randomuser.me/api/portraits/men/42.jpg', pitch: 1.0, rate: 1.05, text: "Well, that's... interesting.", emoji: '😏', categories: ['male', 'character'] },
  { name: 'Spooky Witch', voiceId: 'nova', img: 'https://randomuser.me/api/portraits/women/50.jpg', pitch: 1.5, rate: 0.9, text: "Come closer, my dear...", emoji: '🧙', categories: ['character', 'female'] },
  { name: 'Sports Caster', voiceId: 'alloy', img: 'https://randomuser.me/api/portraits/men/28.jpg', pitch: 1.0, rate: 1.2, text: "And the crowd goes wild!", emoji: '⚽', categories: ['trending', 'male'] },
  { name: 'Cool & Calm', voiceId: 'onyx', img: 'https://randomuser.me/api/portraits/men/15.jpg', pitch: 0.85, rate: 0.9, text: "No rush, take your time.", emoji: '😎', categories: ['male', 'narration'] },
  { name: 'Sweet Kid', voiceId: 'shimmer', img: 'https://randomuser.me/api/portraits/lego/1.jpg', pitch: 1.6, rate: 1.0, text: "Wow, that's so cool!", emoji: '👦', categories: ['character'] },
  { name: 'Professor', voiceId: 'onyx', img: 'https://randomuser.me/api/portraits/men/72.jpg', pitch: 0.8, rate: 0.85, text: "Let me explain this phenomenon.", emoji: '🎓', categories: ['narration', 'male'] },
  { name: 'Diva Queen', voiceId: 'nova', img: 'https://randomuser.me/api/portraits/women/90.jpg', pitch: 1.2, rate: 0.95, text: "I don't do ordinary.", emoji: '💅', categories: ['female', 'character'] },
  { name: 'Storyteller', voiceId: 'fable', img: 'https://randomuser.me/api/portraits/men/82.jpg', pitch: 0.95, rate: 0.85, text: "Once upon a time...", emoji: '📖', categories: ['narration', 'male'] },
  { name: 'Excited Woman', voiceId: 'shimmer', img: 'https://randomuser.me/api/portraits/women/29.jpg', pitch: 1.3, rate: 1.15, text: "Oh my gosh, you have to see this!", emoji: '😄', categories: ['trending', 'female'] },
  { name: 'Robot Voice', voiceId: 'echo', img: 'https://randomuser.me/api/portraits/lego/5.jpg', pitch: 0.7, rate: 0.9, text: "Processing. Please stand by.", emoji: '🤖', categories: ['character'] },
]
const narratorFilterTabs: { label: string; key: NarratorCategory | 'all' }[] = [
  { label: 'Trending', key: 'trending' },
  { label: 'Narration', key: 'narration' },
  { label: 'Female', key: 'female' },
  { label: 'Male', key: 'male' },
  { label: 'Character', key: 'character' },
]

export const VideoBriefNodeContent = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const color = '#3b82f6'
  const updateNodeConfig = useWorkspaceStore((s) => s.updateNodeConfig)
  const setNodes = useWorkspaceStore((s) => s.setNodes)
  const setEdges = useWorkspaceStore((s) => s.setEdges)
  const nodes = useWorkspaceStore((s) => s.nodes)
  const edges = useWorkspaceStore((s) => s.edges)
  const isHighlighted = useWorkspaceStore((s) => s.highlightedNodeId === id)
  const { fitView } = useReactFlow()

  const config = data.config as VideoBriefConfig
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [charPreview, setCharPreview] = useState<string | null>(null)
  const [charGenerating, setCharGenerating] = useState<string | null>(null)
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
  const autoGenerateRef = useRef(false)

  // Close charPreview when clicking outside a char chip or popup
  useEffect(() => {
    if (!charPreview) return
    const close = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('[data-char-chip]') && !target.closest('[data-char-popup]')) {
        setCharPreview(null)
      }
    }
    document.addEventListener('mousedown', close, true)
    return () => document.removeEventListener('mousedown', close, true)
  }, [charPreview])

  // ── Shared: script + character extraction + portraits ────────────────────
  const generateScriptAndCharacters = async (): Promise<any[] | null> => {
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
    console.log('[VideoBrief] Script API response:', JSON.stringify({ characters: scriptData.characters, hasScript: !!scriptData.script }))
    if (!res.ok) throw new Error(scriptData.error || 'Script generation failed')

    let generatedScenes: any[] = []
    try { generatedScenes = JSON.parse(scriptData.script) } catch {
      generatedScenes = [{ scene_number: 1, duration_seconds: 5, visual_description: scriptData.script || 'Scene 1', narration: '' }]
    }

    // Extract characters
    let extractedCharacters = ''
    const extractedNames: string[] = []
    if (Array.isArray(scriptData.characters) && scriptData.characters.length > 0) {
      extractedCharacters = scriptData.characters.join(', ')
      extractedNames.push(...scriptData.characters)
    } else {
      const allText = generatedScenes.map((s: any) => `${s.visual_description || ''} ${s.narration || ''}`).join(' ')
      const namePattern = /\b([A-Z][a-z]{2,}(?:\s+the\s+[A-Z][a-z]+)?)\b/g
      const stopWords = new Set(['The', 'This', 'That', 'Then', 'They', 'Their', 'There', 'Scene', 'Each', 'With', 'From', 'Into', 'Through', 'Where', 'While', 'When', 'Together', 'Important', 'Visual', 'Cartoon'])
      const found = new Set<string>()
      let match
      while ((match = namePattern.exec(allText)) !== null) {
        const name = match[1]
        if (!stopWords.has(name) && name.length < 20) found.add(name)
      }
      if (found.size > 0) {
        const names = Array.from(found).slice(0, 5)
        extractedCharacters = names.join(', ')
        extractedNames.push(...names)
      }
    }
    // Filter: keep characters whose name shares at least one meaningful word with the prompt
    // "White Horse" → "horse" in prompt ✓ | "Pink Rabbit" → "rabbit" not in prompt ✗
    // "Cute Girl" or "Girl" → "girl" in prompt ✓
    const promptLower = (config.prompt || '').toLowerCase()
    const filterStop = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'])
    const filteredNames = extractedNames.filter(name => {
      const words = name.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !filterStop.has(w))
      return words.some(word => promptLower.includes(word))
    })
    // Enforce max 5, fall back to all extracted if filter removes everything (edge case)
    const finalNames = (filteredNames.length > 0 ? filteredNames : extractedNames).slice(0, 5)
    extractedCharacters = finalNames.join(', ')
    extractedNames.length = 0
    extractedNames.push(...finalNames)
    console.log('[VideoBrief] Extracted characters (filtered):', extractedCharacters)

    // Cache scenes + update characters in config
    const now = Date.now()
    const mappedScenes = generatedScenes.map((s: any, idx: number) => ({
      id: `scene-${now}-${idx}`,
      description: s.visual_description || s.description || `Scene ${idx + 1}`,
      duration: Math.min(s.duration_seconds || s.duration || 5, 10),
      script: s.narration || s.script || '',
      imageUrl: '', audioUrl: '', videoUrl: '', status: 'idle',
    }))
    updateNodeConfig(id, { character: extractedCharacters, cachedScenes: mappedScenes })

    // Generate character portraits sequentially
    if (extractedNames.length > 0) {
      let portraitFailed = false
      for (const charName of extractedNames) {
        if (portraitFailed) break
        try {
          const portraitPrompt = `${charName} character portrait, ${config.visualStyle || 'cartoon 3D'} style, full body illustration, vibrant colors, detailed, high quality, white background`
          const imgRes = await fetch('/api/generate/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'flux-schnell', prompt: portraitPrompt }) })
          if (!imgRes.ok) { portraitFailed = true; continue }
          const imgData = await imgRes.json()
          if (imgData.imageUrl) {
            const freshNode = useWorkspaceStore.getState().nodes.find(n => n.id === id)
            const freshImages = (freshNode?.data?.config as VideoBriefConfig)?.characterImageUrls || {}
            updateNodeConfig(id, { characterImageUrls: { ...freshImages, [charName]: imgData.imageUrl } })
          } else { portraitFailed = true }
        } catch { portraitFailed = true }
      }
      if (portraitFailed) toast.error('Character portrait generation failed — check fal.ai API key')
    }

    return mappedScenes
  }

  const handleGenerate = async () => {
    setIsGenerating(true)

    const narratorOption = narratorOptions.find(n => n.name === config.narrator) || narratorOptions[0]
    const narratorVoiceId = narratorOption.voiceId
    const newNodeId = `filmStrip-${Date.now()}`
    let mappedScenes: any[] = []

    // ── Step 1: Script generation (use cache if available) ────────────────────
    try {
      // Reuse cached scenes if already generated (from auto-generate on load)
      if (config.cachedScenes && config.cachedScenes.length > 0) {
        const now = Date.now()
        mappedScenes = config.cachedScenes.map((s: any, idx: number) => ({
          ...s,
          id: `scene-${now}-${idx}`, // fresh IDs for new Film Strip
          imageUrl: '', audioUrl: '', videoUrl: '', status: 'idle',
        }))
        // Clear cache so next Generate re-generates fresh
        updateNodeConfig(id, { cachedScenes: [] })
      } else {
        const scenes = await generateScriptAndCharacters()
        if (!scenes) throw new Error('Script generation failed')
        mappedScenes = scenes
      }

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

      // Use fresh state to preserve character updates made by updateNodeConfig above
      const freshNodes = useWorkspaceStore.getState().nodes
      const freshEdges = useWorkspaceStore.getState().edges
      setNodes([...freshNodes, newNode])
      setEdges([...freshEdges, {
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
      // TTS phase — stop early on auth errors to save credits
      let ttsFailed = false
      for (let i = 0; i < workingScenes.length; i++) {
        if (ttsFailed) break
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
            if (!r.ok) { ttsFailed = r.status === 403 || r.status === 401; continue }
            const d = await r.json()
            if (d.audioUrl) workingScenes[i] = { ...workingScenes[i], audioUrl: d.audioUrl }
          } catch { ttsFailed = true }
        }
        updateNodeConfig(newNodeId, {
          scenes: [...workingScenes], generationPhase: 'tts',
          generationProgress: Math.round(((i + 1) / workingScenes.length) * 100),
        })
      }

      if (ttsFailed) {
        toast.warning('TTS failed — generating visuals...')
      } else {
        toast.success('Audio ready! Generating visuals...')
      }

      // Images phase — stop early on API errors to save credits
      let imageErrors = 0
      let apiFailed = false
      for (let i = 0; i < workingScenes.length; i++) {
        if (apiFailed) break // Don't waste credits if API is down
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
            if (!r.ok) {
              imageErrors++
              apiFailed = r.status === 403 || r.status === 401 // Stop on auth errors
              console.error(`[Image Scene ${i + 1}] HTTP ${r.status}`)
              continue
            }
            const d = await r.json()
            if (d.imageUrl) {
              workingScenes[i] = { ...s, imageUrl: d.imageUrl, status: 'done' }
            } else {
              imageErrors++
              console.error(`[Image Scene ${i + 1}]`, d.error)
            }
          } catch (e: any) {
            imageErrors++
            apiFailed = true
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
        toast.success('Film strip ready!')
      } else if (apiFailed) {
        toast.error('Image generation failed — check fal.ai API key/credits')
      } else {
        toast.warning(`${workingScenes.length - imageErrors}/${workingScenes.length} images generated`)
      }

    } catch (e: any) {
      toast.error(`Generation error: ${e.message}`)
    }
  }

  // Auto-generate when coming from landing page (autoGenerate flag)
  // Only generates script + characters (no Film Strip) — user reviews, then clicks Generate Node
  useEffect(() => {
    const cfg = data.config as VideoBriefConfig
    if (cfg.autoGenerate && !autoGenerateRef.current) {
      autoGenerateRef.current = true
      updateNodeConfig(id, { autoGenerate: false } as any)
      setIsGenerating(true)
      generateScriptAndCharacters().catch(() => {
        toast.error('Auto-generation failed')
      }).finally(() => setIsGenerating(false))
      // No return/cleanup — intentional, prevents Strict Mode from cancelling
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dropdownButtonProps = (key: string) => ({
    onClick: () => setOpenDropdown(openDropdown === key ? null : key),
    className: `flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors w-full ${openDropdown === key ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-transparent hover:border-white/10'}`
  })

  // Visual Style Options — CapCut-style 47 styles
  // Style options — synced with landing page (47 styles + gradient thumbnails)
  const styleOptions = [
    { id: "realistic-film", label: "Realistic Film", emoji: "🎬", gradient: "from-amber-200 to-orange-300" },
    { id: "cartoon-3d", label: "Cartoon 3D", emoji: "🎭", gradient: "from-rose-300 to-pink-400" },
    { id: "photograph", label: "Photograph", emoji: "📷", gradient: "from-amber-100 to-yellow-200" },
    { id: "surreal", label: "Surreal", emoji: "🌀", gradient: "from-purple-300 to-indigo-400" },
    { id: "felt-dolls", label: "Felt Dolls", emoji: "🧸", gradient: "from-sky-200 to-cyan-300" },
    { id: "pastel-paint", label: "Pastel Paint", emoji: "🎨", gradient: "from-pink-200 to-rose-300" },
    { id: "cosmic-horror", label: "Cosmic Horror", emoji: "🌌", gradient: "from-indigo-400 to-purple-600" },
    { id: "urban-sketch", label: "Urban Sketch", emoji: "🏙️", gradient: "from-gray-300 to-slate-400" },
    { id: "dark-deco", label: "Dark Deco", emoji: "🕶️", gradient: "from-zinc-400 to-gray-600" },
    { id: "gta", label: "GTA Style", emoji: "🎮", gradient: "from-green-400 to-emerald-500" },
    { id: "toon-shader", label: "Toon Shader", emoji: "✏️", gradient: "from-sky-300 to-blue-400" },
    { id: "noir-comic", label: "Noir Comic", emoji: "🖤", gradient: "from-gray-600 to-zinc-800" },
    { id: "ink-watercolor", label: "Ink Watercolor", emoji: "🖌️", gradient: "from-emerald-200 to-teal-300" },
    { id: "modern-realism", label: "Modern Realism", emoji: "🏡", gradient: "from-stone-200 to-stone-400" },
    { id: "futuristic", label: "Futuristic", emoji: "🚀", gradient: "from-cyan-400 to-blue-500" },
    { id: "biblical", label: "Biblical", emoji: "✝️", gradient: "from-amber-300 to-yellow-500" },
    { id: "puffy-3d", label: "Puffy 3D", emoji: "🫧", gradient: "from-blue-200 to-sky-300" },
    { id: "urban-dream", label: "Urban Dream", emoji: "💤", gradient: "from-violet-300 to-purple-400" },
    { id: "dreamscape", label: "Dreamscape", emoji: "🌄", gradient: "from-orange-200 to-pink-300" },
    { id: "dynamic", label: "Dynamic", emoji: "⚡", gradient: "from-yellow-400 to-amber-500" },
    { id: "cute-cartoon", label: "Cute Cartoon", emoji: "🌸", gradient: "from-pink-300 to-rose-400" },
    { id: "tiny-world", label: "Tiny World", emoji: "🔬", gradient: "from-green-300 to-teal-400" },
    { id: "claymation", label: "Claymation", emoji: "🏺", gradient: "from-orange-300 to-amber-400" },
    { id: "90s-pixel", label: "90s Pixel", emoji: "👾", gradient: "from-yellow-300 to-amber-400" },
    { id: "low-poly", label: "Low Poly", emoji: "📐", gradient: "from-teal-300 to-cyan-400" },
    { id: "cross-stitch", label: "Cross Stitch", emoji: "🧵", gradient: "from-rose-300 to-pink-400" },
    { id: "epic-fantasy", label: "Epic Fantasy", emoji: "🐉", gradient: "from-red-400 to-orange-500" },
    { id: "anime", label: "Anime", emoji: "🌸", gradient: "from-violet-300 to-purple-400" },
    { id: "jurassic", label: "Jurassic", emoji: "🦕", gradient: "from-green-400 to-emerald-500" },
    { id: "impressionist", label: "Impressionist", emoji: "🖼️", gradient: "from-blue-300 to-indigo-400" },
    { id: "comic-book", label: "Comic Book", emoji: "🦅", gradient: "from-red-300 to-rose-400" },
    { id: "horror", label: "Horror", emoji: "👻", gradient: "from-gray-500 to-zinc-700" },
    { id: "cyberpunk", label: "Cyberpunk", emoji: "🤖", gradient: "from-cyan-400 to-blue-500" },
    { id: "creepy-photo", label: "Creepy Photo", emoji: "🌫️", gradient: "from-slate-400 to-gray-600" },
    { id: "neoclassical", label: "Neoclassical", emoji: "🏛️", gradient: "from-stone-300 to-amber-400" },
    { id: "prehistoric", label: "Prehistoric", emoji: "🪨", gradient: "from-amber-400 to-stone-500" },
    { id: "roman-art", label: "Roman Art", emoji: "🏺", gradient: "from-orange-300 to-amber-400" },
    { id: "nature-photo", label: "Nature Photo", emoji: "🌿", gradient: "from-green-300 to-emerald-400" },
    { id: "pop-art", label: "Pop Art", emoji: "🎯", gradient: "from-red-400 to-yellow-400" },
    { id: "bw-film", label: "B&W Film", emoji: "🎞️", gradient: "from-gray-400 to-zinc-600" },
    { id: "gothic", label: "Gothic", emoji: "🦇", gradient: "from-purple-500 to-zinc-700" },
    { id: "bw-graphic", label: "B&W Graphic", emoji: "✍️", gradient: "from-gray-300 to-zinc-500" },
    { id: "oil-painting", label: "Oil Painting", emoji: "🖼️", gradient: "from-amber-300 to-orange-400" },
    { id: "fairy-tale", label: "Fairy Tale", emoji: "🧚", gradient: "from-pink-300 to-violet-400" },
    { id: "comic-strip", label: "Comic Strip", emoji: "💬", gradient: "from-yellow-300 to-orange-400" },
    { id: "dark-manga", label: "Dark Manga", emoji: "⛩️", gradient: "from-red-500 to-zinc-700" },
    { id: "ancient-chinese", label: "Ancient Chinese", emoji: "🐉", gradient: "from-red-400 to-amber-500" },
  ];

  const [narratorTab, setNarratorTab] = useState<'Voice' | 'Avatar'>('Voice')
  const [narratorFilter, setNarratorFilter] = useState<NarratorCategory | 'all'>('trending')
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
        className={`relative w-[340px] rounded-2xl border transition-all bg-[#0F051D] shadow-2xl z-[1000] ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'} ${isHighlighted ? 'animate-pulse ring-2 ring-[#a78bfa] ring-offset-2 ring-offset-[#0F051D]' : ''}`}
        style={{ borderColor: selected ? color : isHighlighted ? '#a78bfa' : 'rgba(255,255,255,0.15)', boxShadow: selected ? `0 0 30px ${color}30` : isHighlighted ? '0 0 40px rgba(167,139,250,0.3)' : undefined }}>

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
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-50 top-full mt-1 left-0 w-[320px] bg-[#1a0d2e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 origin-top-left">
                        <p className="text-[11px] font-bold text-white mb-2.5">Style</p>
                        <div className="relative">
                          <div className="flex gap-2 overflow-x-auto pb-2 nowheel" style={{ scrollbarWidth: 'none' }}>
                            {/* None option */}
                            <button
                              onClick={() => { updateNodeConfig(id, { visualStyle: '' }); setOpenDropdown(null) }}
                              className="flex-shrink-0 flex flex-col items-center gap-1.5"
                            >
                              <div className={`w-[56px] h-[70px] rounded-xl border-2 flex items-center justify-center transition-all ${!config.visualStyle ? 'border-[#a78bfa] bg-white/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                                <X className="w-4 h-4 text-zinc-500" />
                              </div>
                              <span className="text-[9px] text-zinc-400 w-[56px] text-center truncate">None</span>
                            </button>
                            {styleOptions.map(s => (
                              <button
                                key={s.id}
                                onClick={() => { updateNodeConfig(id, { visualStyle: s.label }); setOpenDropdown(null) }}
                                className="flex-shrink-0 flex flex-col items-center gap-1.5"
                              >
                                <div className={`w-[56px] h-[70px] rounded-xl border-2 overflow-hidden transition-all ${config.visualStyle === s.label ? 'border-[#a78bfa] ring-1 ring-[#a78bfa]/30' : 'border-transparent hover:border-white/20'}`}>
                                  <div className={`w-full h-full bg-gradient-to-br ${s.gradient} flex items-center justify-center text-xl`}>
                                    {s.emoji}
                                  </div>
                                </div>
                                <span className={`text-[9px] w-[56px] text-center truncate ${config.visualStyle === s.label ? 'text-white font-medium' : 'text-zinc-400'}`}>{s.label}</span>
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              const container = document.querySelector('[data-style-scroll]')
                              container?.scrollBy({ left: 180, behavior: 'smooth' })
                            }}
                            className="absolute right-0 top-0 h-[70px] w-6 flex items-center justify-center bg-gradient-to-l from-[#1a0d2e] to-transparent"
                          >
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 -rotate-90" />
                          </button>
                        </div>
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
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center text-[8px]">{currentNarrator.emoji}</div>
                      <span className="text-[11px] font-bold text-white truncate">{config.narrator}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'narrator' && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-50 top-full mt-1 left-0 w-[320px] bg-[#1a0d2e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 origin-top-left">
                        {/* Tabs */}
                        <div className="flex gap-3 mb-3">
                          <button onClick={() => setNarratorTab('Voice')} className={`text-[11px] font-semibold pb-1 border-b-2 transition-all ${narratorTab === 'Voice' ? 'text-white border-[#a78bfa]' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>Voice</button>
                          <button onClick={() => setNarratorTab('Avatar')} className={`text-[11px] font-semibold pb-1 border-b-2 transition-all ${narratorTab === 'Avatar' ? 'text-white border-[#a78bfa]' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>Avatars</button>
                        </div>

                        {narratorTab === 'Voice' ? (
                          <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto nowheel" style={{ scrollbarWidth: 'thin' }}>
                            {/* None option */}
                            <button
                              onClick={() => { updateNodeConfig(id, { narrator: '' }); setOpenDropdown(null) }}
                              className={`flex items-center gap-2 px-2 py-2 rounded-xl border transition-all ${!config.narrator ? 'border-[#a78bfa] bg-white/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                            >
                              <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                <X className="w-3 h-3 text-zinc-500" />
                              </div>
                              <span className="text-[10px] text-zinc-400 truncate">None</span>
                            </button>
                            {narratorOptions.map(opt => (
                              <button
                                key={opt.name}
                                onClick={() => { updateNodeConfig(id, { narrator: opt.name }); setOpenDropdown(null) }}
                                className={`flex items-center gap-2 px-2 py-2 rounded-xl border transition-all ${config.narrator === opt.name ? 'border-[#a78bfa] bg-white/10' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'}`}
                              >
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center text-sm flex-shrink-0">
                                  {opt.emoji}
                                </div>
                                <span className={`text-[10px] truncate ${config.narrator === opt.name ? 'text-white font-medium' : 'text-zinc-300'}`}>{opt.name}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <Volume2 className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                            <p className="text-zinc-500 text-[11px]">AI avatars coming soon</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-[11px] text-zinc-400 w-24 pt-1">Character</span>
                <div className="flex-1">
                  {(() => {
                    const characterNames = config.character ? config.character.split(',').map(c => c.trim()).filter(Boolean) : [];
                    const charImages = config.characterImageUrls || {} as Record<string, string>;

                    const generateCharImage = async (name: string) => {
                      setCharGenerating(name)
                      try {
                        const prompt = `${name} character portrait, ${config.visualStyle || 'cartoon 3D'} style, full body illustration, vibrant colors, detailed, high quality, white background`
                        const res = await fetch('/api/generate/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'flux-schnell', prompt }) })
                        if (!res.ok) { toast.error(`Image API error (${res.status})`); setCharGenerating(null); return }
                        const d = await res.json()
                        if (d.imageUrl) {
                          // Read fresh state to avoid overwriting other portraits
                          const freshNode = useWorkspaceStore.getState().nodes.find(n => n.id === id)
                          const freshImages = (freshNode?.data?.config as VideoBriefConfig)?.characterImageUrls || {}
                          updateNodeConfig(id, { characterImageUrls: { ...freshImages, [name]: d.imageUrl } })
                        } else {
                          toast.error(`Failed: ${d.error || 'Unknown'}`)
                        }
                      } catch { toast.error('Character image generation failed') }
                      setCharGenerating(null)
                    }

                    return (
                      <div className="flex flex-wrap gap-2 items-center">
                        {characterNames.map(name => {
                          const imgUrl = charImages[name]
                          const isGen = charGenerating === name
                          return (
                            <div key={name} className="relative group">
                              {/* Character chip — referans: yuvarlak avatar + isim */}
                              <button
                                data-char-chip={name}
                                onClick={() => setCharPreview(charPreview === name ? null : name)}
                                className={`inline-flex items-center gap-2 bg-white/5 border rounded-full pl-1 pr-3.5 py-1 transition-all cursor-pointer ${charPreview === name ? 'border-[#a78bfa]/50 bg-white/10 shadow-lg shadow-[#a78bfa]/10' : 'border-white/10 hover:border-white/20'}`}
                              >
                                {/* Round avatar */}
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10 shadow-sm">
                                  {isGen ? (
                                    <div className="w-full h-full bg-gradient-to-br from-[#a78bfa]/30 to-[#7c3aed]/30 flex items-center justify-center">
                                      <Loader2 className="w-3.5 h-3.5 text-[#a78bfa] animate-spin" />
                                    </div>
                                  ) : imgUrl ? (
                                    <img src={imgUrl} alt={name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#a78bfa]/20 to-[#7c3aed]/20 border border-dashed border-[#a78bfa]/40 flex items-center justify-center">
                                      <Zap className="w-3.5 h-3.5 text-[#a78bfa]" />
                                    </div>
                                  )}
                                </div>
                                <span className="text-[11px] font-bold text-zinc-100">{name}</span>
                              </button>

                              {/* Delete on hover */}
                              <button
                                onClick={() => {
                                  const updated = characterNames.filter(c => c !== name).join(', ')
                                  const newImages = { ...charImages }
                                  delete newImages[name]
                                  updateNodeConfig(id, { character: updated, characterImageUrls: newImages })
                                  if (charPreview === name) setCharPreview(null)
                                }}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>

                              {/* Image Preview Popup — referans: büyük resim + Upload/Re-generate */}
                              <AnimatePresence>
                                {charPreview === name && (
                                  <motion.div
                                    data-char-popup
                                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                    className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 bg-[#1a0d2e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                                    style={{ width: 240 }}
                                  >
                                    {/* Large Preview */}
                                    <div className="w-full aspect-square bg-black/30 flex items-center justify-center relative">
                                      {isGen ? (
                                        <div className="flex flex-col items-center gap-2">
                                          <Loader2 className="w-10 h-10 text-[#a78bfa] animate-spin" />
                                          <span className="text-[10px] text-zinc-500">Generating...</span>
                                        </div>
                                      ) : imgUrl ? (
                                        <img src={imgUrl} alt={name} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="flex flex-col items-center gap-2 text-zinc-500">
                                          <ImageIcon className="w-10 h-10" />
                                          <span className="text-[10px]">No portrait yet</span>
                                        </div>
                                      )}
                                      {/* Name badge */}
                                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                        <span className="text-[11px] font-bold text-white">{name}</span>
                                      </div>
                                    </div>

                                    {/* Action Buttons: Upload + Re-generate */}
                                    <div className="p-2.5 flex gap-2">
                                      <label className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
                                        <Upload className="w-3.5 h-3.5" />
                                        Upload
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (!file) return
                                            const reader = new FileReader()
                                            reader.onload = () => {
                                              const dataUrl = reader.result as string
                                              updateNodeConfig(id, { characterImageUrls: { ...charImages, [name]: dataUrl } })
                                            }
                                            reader.readAsDataURL(file)
                                          }}
                                        />
                                      </label>
                                      <button
                                        onClick={() => generateCharImage(name)}
                                        disabled={isGen}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[10px] font-semibold text-[#a78bfa] hover:bg-[#a78bfa]/20 transition-all disabled:opacity-50"
                                      >
                                        <RefreshCw className={`w-3.5 h-3.5 ${isGen ? 'animate-spin' : ''}`} />
                                        {imgUrl ? 'Re-generate' : 'Generate'}
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                        })}
                        {/* Add character button */}
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === 'character' ? null : 'character')}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-[10px] text-zinc-500 border border-dashed border-white/15 hover:border-[#a78bfa]/40 hover:text-[#a78bfa] transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                          <AnimatePresence>
                            {openDropdown === 'character' && (
                              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-50 top-full mt-1 left-0 w-56 bg-[#1a0d2e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-3 origin-top-left">
                                <div className="text-[10px] font-bold text-white mb-2">Add character</div>
                                <input
                                  autoFocus
                                  type="text"
                                  placeholder="Character name (Enter to add)"
                                  className="w-full bg-black/20 border border-white/10 rounded-lg px-2.5 py-2 text-[10px] text-white outline-none focus:border-[#a78bfa]/50 focus:ring-1 focus:ring-[#a78bfa]/30"
                                  onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const val = e.currentTarget.value.trim();
                                      if (val && !characterNames.includes(val)) {
                                        const newChar = config.character ? `${config.character}, ${val}` : val;
                                        updateNodeConfig(id, { character: newChar });
                                        e.currentTarget.value = '';
                                        setOpenDropdown(null);
                                        // Auto-generate portrait
                                        generateCharImage(val);
                                      }
                                    }
                                  }}
                                />
                                <p className="text-[8px] text-zinc-600 mt-1.5">Portrait auto-generates in <span className="text-[#a78bfa]">{config.visualStyle}</span> style</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
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
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-50 top-full mt-1 right-0 w-64 bg-[#1a0d2e] border border-white/10 rounded-2xl shadow-2xl p-2 origin-top-right">
                        <style>{`
                          @keyframes capGlow {
                            0%, 100% { filter: brightness(1); opacity: 0.85; }
                            50% { filter: brightness(2.2) saturate(1.5); opacity: 1; }
                          }
                          .cap-glow-anim { animation: capGlow 1.6s ease-in-out infinite; }
                        `}</style>
                        <div className="text-[11px] font-bold text-white mb-2 ml-1">Captions</div>
                        <div className="grid grid-cols-3 gap-1.5 overflow-y-auto nowheel p-1">
                          {captionStyles.map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => { updateNodeConfig(id, { captions: opt.id }); setOpenDropdown(null) }}
                              className={`rounded-xl border transition-all overflow-hidden relative ${config.captions === opt.id ? 'border-[#3b82f6] ring-1 ring-[#3b82f6]/50' : 'border-white/10 hover:border-white/30'}`}
                              style={{ height: 60 }}
                            >
                              {/* Simulated video bg */}
                              <div className="absolute inset-0 bg-gradient-to-b from-slate-700/60 to-black/80" />
                              {/* Fake scene lines */}
                              <div className="absolute inset-x-2 top-2 space-y-1 opacity-20">
                                <div className="h-1 bg-white/40 rounded-full w-3/4" />
                                <div className="h-1 bg-white/30 rounded-full w-1/2" />
                              </div>
                              {/* Caption text */}
                              <div className="absolute inset-x-0 bottom-2 flex justify-center px-1">
                                {opt.type === 'none' ? (
                                  <span className="text-zinc-500 text-base">⊘</span>
                                ) : (
                                  <span
                                    className={`text-[8px] font-black uppercase text-center leading-tight ${opt.glow ? 'cap-glow-anim' : ''}`}
                                    style={{
                                      color: opt.color,
                                      textShadow: opt.glow ? `0 0 8px ${opt.color}, 0 0 16px ${opt.color}80` : 'none',
                                    }}
                                  >
                                    {opt.label}
                                  </span>
                                )}
                              </div>
                              {/* Selected check */}
                              {config.captions === opt.id && (
                                <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#3b82f6] flex items-center justify-center z-10">
                                  <Check className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Scene Media — Dropdown with descriptions */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-400 w-24">Scene media</span>
                <div className="flex-1 relative">
                  <button {...dropdownButtonProps('sceneMedia')}>
                    <div className="flex items-center gap-1.5">
                      {config.sceneMedia === 'Images' ? <ImageIcon className="w-3.5 h-3.5 text-zinc-400" /> : <MonitorPlay className="w-3.5 h-3.5 text-zinc-400" />}
                      <span className="text-[11px] text-white">{config.sceneMedia || 'Images'}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'sceneMedia' && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-50 top-full mt-1 right-0 w-56 bg-[#1a0d2e] border border-white/10 rounded-xl shadow-2xl p-1.5 origin-top-right">
                        <div
                          onClick={() => { updateNodeConfig(id, { sceneMedia: 'Images' }); setOpenDropdown(null) }}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${config.sceneMedia === 'Images' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                        >
                          <ImageIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-semibold text-white">Images</div>
                            <div className="text-[9px] text-zinc-500">Use static image per scene</div>
                          </div>
                          {config.sceneMedia === 'Images' && <Check className="w-3.5 h-3.5 text-[#22d3ee] shrink-0" />}
                        </div>
                        <div
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-not-allowed opacity-50"
                        >
                          <MonitorPlay className="w-4 h-4 text-zinc-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-semibold text-zinc-500">Video clips</div>
                            <div className="text-[9px] text-zinc-600">Use video clip per scene</div>
                          </div>
                          <span className="text-[8px] font-bold text-white bg-[#22d3ee] px-1.5 py-0.5 rounded-full shrink-0">Pro</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
  const [showContextMenu, setShowContextMenu] = useState<number | null>(null)

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

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {scenes.map((scene, i) => {
            const isFaded = !scene.imageUrl && scene.status !== 'generating' && scene.status !== 'done'
            return (
              <div key={scene.id || i}>
                <div
                  onClick={() => { setActiveScene(i); setShowContextMenu(null) }}
                  onMouseEnter={() => setHoveredScene(i)}
                  onMouseLeave={() => { setHoveredScene(null); setShowContextMenu(null) }}
                  className={`flex gap-3 px-3 py-3 cursor-pointer transition-all relative group ${activeScene === i ? 'bg-[#00B5CF]/10' : 'hover:bg-white/[0.03]'} ${isFaded ? 'opacity-40' : ''}`}
                >
                  {/* Drag handle */}
                  <span className="absolute left-0.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity select-none cursor-grab">⣿</span>

                  <div className="flex-1 space-y-1.5 pl-2">
                    {/* Meta row: time + narrator avatar + speaker */}
                    <div className="flex items-center gap-1.5 relative">
                      <span className="text-[10px] text-zinc-500 font-medium tabular-nums">00:{String(scene.duration || 5).padStart(2, '0')}</span>
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center text-[7px] font-bold text-white shrink-0">{currentNarrator.name.charAt(0)}</div>
                      <span className="text-[10px] text-zinc-500">{currentNarrator.name}</span>
                    </div>
                    {/* Script text */}
                    <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-3">{scene.script || scene.description}</p>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-[80px] h-[56px] rounded-md overflow-hidden bg-black/60 flex-shrink-0 relative border border-white/10 flex items-center justify-center">
                    {scene.imageUrl ? (
                      <img src={scene.imageUrl} alt={`Scene ${i + 1}`} className="w-full h-full object-cover" />
                    ) : scene.status === 'generating' ? (
                      <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-white/20" />
                    )}
                    {/* Thumbnail hover actions */}
                    {hoveredScene === i && scene.imageUrl && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1 z-10">
                        <button onClick={(e) => { e.stopPropagation(); setShowMediaModal(i); }} className="p-1 hover:bg-white/20 rounded text-white transition-colors" title="Replace"><RefreshCw className="w-3 h-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); setShowTrimModal(i); }} className="p-1 hover:bg-white/20 rounded text-white transition-colors" title="Trim"><Scissors className="w-3 h-3" /></button>
                      </div>
                    )}
                    {/* Time badge */}
                    <div className="absolute bottom-1 left-1 text-[8px] bg-black/70 px-1 rounded text-white font-medium tabular-nums">0:{String(scene.duration || 5).padStart(2, '0')}</div>
                  </div>

                  {/* ··· Context menu button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowContextMenu(showContextMenu === i ? null : i) }}
                    className="absolute top-2 right-2 text-zinc-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>

                  {/* Context menu dropdown */}
                  {showContextMenu === i && (
                    <div className="absolute top-8 right-2 w-28 bg-[#1a0d2e] border border-white/10 rounded-lg shadow-2xl z-50 p-1 overflow-hidden" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          const newScene = { ...scene, id: `scene-${Date.now()}-dup` }
                          const updated = [...scenes]
                          updated.splice(i + 1, 0, newScene)
                          updateNodeConfig(id, { scenes: updated })
                          setShowContextMenu(null)
                        }}
                        className="w-full text-left px-3 py-1.5 text-[10px] text-zinc-300 hover:bg-white/10 rounded flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Duplicate
                      </button>
                      <button
                        onClick={() => {
                          const updated = scenes.filter((_, idx) => idx !== i)
                          updateNodeConfig(id, { scenes: updated })
                          setShowContextMenu(null)
                          if (activeScene >= updated.length) setActiveScene(Math.max(0, updated.length - 1))
                        }}
                        className="w-full text-left px-3 py-1.5 text-[10px] text-red-400 hover:bg-red-500/10 rounded flex items-center gap-2 transition-colors"
                      >
                        <Trash className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
                {/* Separator */}
                {i < scenes.length - 1 && <div className="mx-3 border-t border-white/5" />}
              </div>
            )
          })}
          {scenes.length === 0 && (
            <div className="p-4 text-center text-xs text-zinc-500">No scenes generated yet.</div>
          )}
        </div>
      </div>

      {/* Right Pane: Video Preview */}
      <div className="flex-1 flex flex-col p-4 bg-[#0F051D] rounded-r-2xl relative">
        {/* Tag row — style + elements */}
        <div className="flex gap-2 items-center mb-3">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1 cursor-pointer hover:bg-white/10 transition-colors">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center text-[6px] font-bold text-white shrink-0">{currentNarrator.name.charAt(0)}</div>
            <span className="text-[10px] text-zinc-400 truncate max-w-[80px]">{config.visualStyle || 'Style'}</span>
          </div>
          <button
            onClick={() => { setShowElementsPanel(v => !v); setShowMusicPanel(false) }}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${showElementsPanel ? 'bg-white text-black' : 'bg-white/90 text-black hover:bg-white'}`}
          >
            <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center"><Check className="w-2 h-2 text-white" /></div>
            Elements
          </button>
        </div>

        <div className="flex justify-between items-center mb-3">
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
                      <div key={m.name} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors group ${(config as any).music === m.name ? 'bg-white/10' : 'hover:bg-white/5'}`} onClick={() => { updateNodeConfig(id, { music: m.name }); setShowMusicPanel(false) }}>
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

