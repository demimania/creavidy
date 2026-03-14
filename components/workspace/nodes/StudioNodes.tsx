'use client'

import { memo, useState, useEffect, useRef, useCallback } from 'react'
import { Handle, Position, type NodeProps, useReactFlow } from 'reactflow'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Play, Pause, Loader2, ChevronDown, Check, Settings2, Image as ImageIcon, MonitorPlay, Film, Zap, Music, RefreshCw, Youtube, Instagram, Search, Filter, SlidersHorizontal, Plus, Square, Scissors, Trash, Download, Volume2, VolumeX, Edit2, Heart, TrendingUp, Maximize2, MoreHorizontal, X, ArrowLeft, Upload, Copy
} from 'lucide-react'
import { useWorkspaceStore, type NodeData, type VideoBriefConfig, type FilmStripConfig } from '@/lib/stores/workspace-store'
import { toast } from 'sonner'
import { useClickOutside } from '@/lib/hooks/use-click-outside'
import { composeVideo, type CaptionStyle } from '@/lib/utils/video-composer'

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

  // Click-outside: close dropdowns when clicking outside the node
  const nodeClickOutsideRef = useClickOutside<HTMLDivElement>(
    () => setOpenDropdown(null),
    !!openDropdown
  )
  // Merge nodeRef with click-outside ref
  const setNodeRefs = useCallback((el: HTMLDivElement | null) => {
    (nodeRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    (nodeClickOutsideRef as React.MutableRefObject<HTMLDivElement | null>).current = el
  }, [nodeClickOutsideRef])

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
      duration: s.duration_seconds || s.duration || 5,
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

  // Visual Style Options — 47 Creavidy styles
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
      <motion.div ref={setNodeRefs} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className={`relative w-[340px] rounded-2xl border transition-all bg-[#0F051D] shadow-2xl z-[1000] ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'} ${isHighlighted ? 'animate-pulse ring-2 ring-[#a78bfa] ring-offset-2 ring-offset-[#0F051D]' : ''}`}
        style={{ border: `1px solid ${selected ? color : isHighlighted ? '#a78bfa' : color + '45'}`, borderLeft: `3px solid ${selected ? color : isHighlighted ? '#a78bfa' : color + 'CC'}`, boxShadow: selected ? `0 0 30px ${color}35` : isHighlighted ? '0 0 40px rgba(167,139,250,0.3)' : `0 0 16px ${color}18` }}>

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-t-2xl border-b border-white/10" style={{ background: `linear-gradient(135deg, ${color}35 0%, ${color}12 100%)` }}>
          <FileText className="w-4 h-4" style={{ color }} />
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
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null)

  // Panel and Modal States
  const [showNarratorDropdown, setShowNarratorDropdown] = useState<number | null>(null)
  const [showCaptionsPopup, setShowCaptionsPopup] = useState(false)
  const [showMusicPopup, setShowMusicPopup] = useState(false)
  const [filmMusicVolume, setFilmMusicVolume] = useState<Record<string, number>>({})
  const [filmPlayingPreview, setFilmPlayingPreview] = useState<string | null>(null)
  const filmAudioRef = useRef<HTMLAudioElement | null>(null)
  const filmMasterGainRef = useRef<GainNode | null>(null)

  // Click-outside refs for popups
  const captionsBtnRef = useRef<HTMLButtonElement>(null)
  const musicBtnRef = useRef<HTMLButtonElement>(null)
  const captionsPopupRef = useClickOutside(() => setShowCaptionsPopup(false), showCaptionsPopup, captionsBtnRef)
  const musicPopupRef = useClickOutside(() => { setShowMusicPopup(false); filmAudioRef.current?.pause(); setFilmPlayingPreview(null) }, showMusicPopup, musicBtnRef)

  // Slideshow playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(true)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sceneAudioRef = useRef<HTMLAudioElement | null>(null)
  const audioResolvedDurations = useRef<Record<number, number>>({})
  const volumeBtnRef = useRef<HTMLButtonElement>(null)
  const volumePopupRef = useClickOutside(() => setShowVolumeSlider(false), showVolumeSlider, volumeBtnRef)
  
  const [showMediaModal, setShowMediaModal] = useState<number | null>(null)
  const [mediaTab, setMediaTab] = useState<'ai' | 'stock' | 'your'>('ai')
  const [mediaStyle, setMediaStyle] = useState('')
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [mediaRatio, setMediaRatio] = useState<'16:9' | '9:16'>('16:9')
  const [mediaPrompt, setMediaPrompt] = useState('')
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [stockSearch, setStockSearch] = useState('')
  const [uploadedMedia, setUploadedMedia] = useState<{ url: string; name: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showTrimModal, setShowTrimModal] = useState<number | null>(null)
  const [showContextMenu, setShowContextMenu] = useState<number | null>(null)

  // Click-outside: close scene context menu
  useEffect(() => {
    if (showContextMenu === null) return
    const close = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('[data-scene-ctx]')) setShowContextMenu(null)
    }
    document.addEventListener('mousedown', close, true)
    return () => document.removeEventListener('mousedown', close, true)
  }, [showContextMenu])

  // Escape key: close media modal & trim modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (showMediaModal !== null) { setShowMediaModal(null); return }
      if (showTrimModal !== null) { setShowTrimModal(null); return }
    }
    document.addEventListener('keydown', handleEsc, true)
    return () => document.removeEventListener('keydown', handleEsc, true)
  }, [showMediaModal, showTrimModal])

  // Visual style options (same as VideoBrief)
  const mediaStyleOptions = [
    { id: "realistic-film", label: "Realistic Film", emoji: "🎬", gradient: "from-amber-200 to-orange-300" },
    { id: "cartoon-3d", label: "Cartoon 3D", emoji: "🎭", gradient: "from-rose-300 to-pink-400" },
    { id: "photograph", label: "Photograph", emoji: "📷", gradient: "from-amber-100 to-yellow-200" },
    { id: "surreal", label: "Surreal", emoji: "🌀", gradient: "from-purple-300 to-indigo-400" },
    { id: "anime", label: "Anime", emoji: "🌸", gradient: "from-violet-300 to-purple-400" },
    { id: "cyberpunk", label: "Cyberpunk", emoji: "🤖", gradient: "from-cyan-400 to-blue-500" },
    { id: "pastel-paint", label: "Pastel Paint", emoji: "🎨", gradient: "from-pink-200 to-rose-300" },
    { id: "comic-book", label: "Comic Book", emoji: "🦅", gradient: "from-red-300 to-rose-400" },
    { id: "noir-comic", label: "Noir Comic", emoji: "🖤", gradient: "from-gray-600 to-zinc-800" },
    { id: "ink-watercolor", label: "Ink Watercolor", emoji: "🖌️", gradient: "from-emerald-200 to-teal-300" },
    { id: "futuristic", label: "Futuristic", emoji: "🚀", gradient: "from-cyan-400 to-blue-500" },
    { id: "claymation", label: "Claymation", emoji: "🏺", gradient: "from-orange-300 to-amber-400" },
    { id: "gta", label: "GTA Style", emoji: "🎮", gradient: "from-green-400 to-emerald-500" },
    { id: "epic-fantasy", label: "Epic Fantasy", emoji: "🐉", gradient: "from-red-400 to-orange-500" },
    { id: "90s-pixel", label: "90s Pixel", emoji: "👾", gradient: "from-yellow-300 to-amber-400" },
    { id: "horror", label: "Horror", emoji: "👻", gradient: "from-gray-500 to-zinc-700" },
  ]

  // Reset media modal state when opening
  const openMediaModal = (sceneIdx: number) => {
    setShowMediaModal(sceneIdx)
    setMediaTab('ai')
    setMediaStyle(config.visualStyle || '')
    setMediaPrompt(scenes[sceneIdx]?.script || scenes[sceneIdx]?.description || '')
    setGeneratedPreview(null)
    setIsGeneratingPreview(false)
    setStockSearch('')
  }

  const updateNodeConfig = useWorkspaceStore((s) => s.updateNodeConfig)

  const config = (data.config as FilmStripConfig) || { scenes: [] }
  const scenes = config.scenes || []

  const filmCaptionStyles = [
    { id: 'none', label: 'None', type: 'none', font: '', bg: '', shadow: false, uppercase: false, outline: false },
    { id: 'hormozi', label: 'HORMOZI', color: '#ffffff', bg: '#000000', font: 'Impact', glow: false, uppercase: true, outline: false, desc: 'Bold white on black bar — Alex Hormozi style' },
    { id: 'karaoke', label: 'KARAOKE', color: '#facc15', bg: '', font: 'Arial Black', glow: true, uppercase: true, outline: true, desc: 'Yellow highlight word-by-word sync' },
    { id: 'netflix', label: 'Netflix', color: '#ffffff', bg: 'rgba(0,0,0,0.75)', font: 'Helvetica Neue', glow: false, uppercase: false, outline: false, desc: 'Clean white on semi-transparent bar' },
    { id: 'tiktok-bounce', label: 'TIKTOK', color: '#00F2FE', bg: '', font: 'Montserrat', glow: true, uppercase: true, outline: true, desc: 'Neon cyan bounce — viral TikTok style' },
    { id: 'cinematic', label: 'Cinematic', color: '#e2e8f0', bg: '', font: 'Georgia', glow: false, uppercase: false, outline: false, desc: 'Elegant serif — documentary feel' },
    { id: 'comic', label: 'COMIC!', color: '#fbbf24', bg: '#dc2626', font: 'Comic Sans MS', glow: false, uppercase: true, outline: true, desc: 'Fun comic book pop style' },
    { id: 'neon-glow', label: 'NEON', color: '#c084fc', bg: '', font: 'Orbitron', glow: true, uppercase: true, outline: false, desc: 'Purple neon glow — synthwave vibe' },
    { id: 'minimal', label: 'minimal', color: '#a1a1aa', bg: '', font: 'Inter', glow: false, uppercase: false, outline: false, desc: 'Subtle lowercase — clean & modern' },
  ]

  const filmMusicOptions = [
    { name: 'Deep background...', author: 'Art Music Style', duration: '02:49', color: '#10b981' },
    { name: 'Background Music', author: 'IlyaSound', duration: '03:36', color: '#3b82f6' },
    { name: 'Positive background...', author: 'earbrojp', duration: '03:04', color: '#f472b6' },
    { name: 'Ambient Background', author: 'Pumputhemind', duration: '01:24', color: '#8b5cf6' },
    { name: 'Cinematic Intro', author: 'HansZ', duration: '02:10', color: '#f59e0b' },
    { name: 'LoFi Study Vibe', author: 'ChillMix', duration: '04:20', color: '#8b5cf6' },
    { name: 'Upbeat Pop', author: 'SunnyDayz', duration: '02:55', color: '#ec4899' },
    { name: 'Dark Synthwave', author: 'NeonNight', duration: '03:45', color: '#6366f1' },
  ]

  const playFilmMusicPreview = (name: string, volumeDb: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (filmPlayingPreview === name) {
      filmAudioRef.current?.pause()
      filmAudioRef.current = null
      filmMasterGainRef.current = null
      setFilmPlayingPreview(null)
      return
    }
    filmAudioRef.current?.pause()
    setFilmPlayingPreview(name)
    try {
      const ctx = new AudioContext()
      const masterGain = ctx.createGain()
      masterGain.gain.value = Math.pow(10, volumeDb / 20)
      masterGain.connect(ctx.destination)
      filmMasterGainRef.current = masterGain
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
      setTimeout(() => { filmMasterGainRef.current = null; setFilmPlayingPreview(null) }, 3100)
    } catch {
      setFilmPlayingPreview(null)
    }
  }

  // Calculate dynamic duration based on script word count (~2.5 words/sec for narration)
  const getSceneDuration = (scene: typeof scenes[number]) => {
    const text = scene.script || scene.description || ''
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length
    if (wordCount === 0) return scene.duration || 5
    const calculated = Math.round(wordCount / 2.5)
    return Math.max(3, Math.min(15, calculated)) // clamp 3-15 seconds
  }

  // Safe fallback if scenes array is empty
  const currentScene = scenes[activeScene] || null
  const currentNarrator = narratorOptions.find(n => n.voiceId === (config.narratorVoiceId || 'alloy')) || narratorOptions[0]

  // Store actions for node duplicate/delete
  const removeNode = useWorkspaceStore((s) => s.removeNode)
  const duplicateNode = useWorkspaceStore((s) => s.duplicateNode)

  // Total duration and per-scene cumulative offsets
  const sceneDurations = scenes.map(s => getSceneDuration(s))
  const totalDuration = sceneDurations.reduce((a, b) => a + b, 0)
  const sceneOffsets = sceneDurations.reduce<number[]>((acc, d, i) => { acc.push(i === 0 ? 0 : acc[i - 1] + sceneDurations[i - 1]); return acc }, [])

  // Slideshow timecode ticker — only advances time display
  // Scene transitions are handled by audio 'ended' event (when audio exists)
  // or by timer when no audio
  useEffect(() => {
    if (!isPlaying || scenes.length === 0) return
    const hasAudio = !!scenes[activeScene]?.audioUrl
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.1
        if (next >= totalDuration) { setIsPlaying(false); return totalDuration }
        // If no audio for current scene, use timer-based scene transition
        if (!hasAudio) {
          let sceneIdx = 0
          for (let i = 0; i < sceneOffsets.length; i++) {
            if (next >= sceneOffsets[i]) sceneIdx = i
          }
          if (sceneIdx !== activeScene) setActiveScene(sceneIdx)
        }
        return next
      })
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying, scenes.length, totalDuration, activeScene])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Sync volume & play state to video element
  useEffect(() => {
    if (!videoRef.current) return
    videoRef.current.volume = volume
    videoRef.current.muted = isMuted
    if (isPlaying) videoRef.current.play().catch(() => {})
    else videoRef.current.pause()
  }, [volume, isMuted, isPlaying, activeScene])

  // Scene voiceover audio playback
  useEffect(() => {
    const scene = scenes[activeScene]
    // Stop previous audio
    if (sceneAudioRef.current) {
      sceneAudioRef.current.pause()
      sceneAudioRef.current.src = ''
      sceneAudioRef.current = null
    }
    if (!isPlaying || !scene?.audioUrl) return

    const audio = new Audio(scene.audioUrl)
    audio.volume = isMuted ? 0 : volume
    sceneAudioRef.current = audio

    // When metadata loads, store actual duration for better timeline accuracy
    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && isFinite(audio.duration)) {
        audioResolvedDurations.current[activeScene] = audio.duration
      }
    })

    // When voiceover ends, advance to next scene
    audio.addEventListener('ended', () => {
      if (activeScene < scenes.length - 1) {
        setActiveScene(prev => prev + 1)
      } else {
        setIsPlaying(false)
        setCurrentTime(totalDuration)
      }
    })

    audio.play().catch(() => {})

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [isPlaying, activeScene])

  // Sync volume/mute to scene audio
  useEffect(() => {
    if (!sceneAudioRef.current) return
    sceneAudioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  // Seek handler
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (totalDuration === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newTime = pct * totalDuration
    setCurrentTime(newTime)
    let sceneIdx = 0
    for (let i = 0; i < sceneOffsets.length; i++) {
      if (newTime >= sceneOffsets[i]) sceneIdx = i
    }
    setActiveScene(sceneIdx)
  }

  return (
    <div className="relative">
      {/* Node utility buttons — above the node */}
      <div className="absolute -top-9 right-0 flex items-center gap-1.5 z-50">
        <button
          onClick={() => duplicateNode(id)}
          className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-[9px] text-zinc-400 hover:text-white transition-colors"
          title="Duplicate node"
        >
          <Copy className="w-3 h-3" /> Duplicate
        </button>
        <button
          onClick={() => removeNode(id)}
          className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-red-500/20 border border-white/10 rounded-lg text-[9px] text-zinc-400 hover:text-red-400 transition-colors"
          title="Delete node"
        >
          <Trash className="w-3 h-3" /> Delete
        </button>
      </div>

    <motion.div initial={{ scale: 0.95, opacity: 0, x: -20 }} animate={{ scale: 1, opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative flex w-[800px] h-[500px] rounded-2xl border transition-all bg-[#0F051D] shadow-2xl ${selected ? 'ring-2 ring-offset-2 ring-offset-[#0F051D]' : 'hover:shadow-lg'}`}
      style={{ border: `1px solid ${selected ? color : color + '45'}`, borderLeft: `3px solid ${selected ? color : color + 'CC'}`, boxShadow: selected ? `0 0 30px ${color}35` : `0 0 16px ${color}18` }}>

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
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10" style={{ background: `linear-gradient(135deg, ${color}35 0%, ${color}12 100%)` }}>
          <Film className="w-4 h-4" style={{ color }} />
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
                      <span className="text-[10px] text-zinc-500 font-medium tabular-nums">00:{String(getSceneDuration(scene)).padStart(2, '0')}</span>
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
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1.5 z-10">
                        <button onClick={(e) => { e.stopPropagation(); openMediaModal(i); }} className="p-1.5 bg-white/10 hover:bg-white/30 rounded-md text-white transition-colors" title="Replace"><RefreshCw className="w-3 h-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); setShowTrimModal(i); }} className="p-1.5 bg-white/10 hover:bg-white/30 rounded-md text-white transition-colors" title="Trim"><Scissors className="w-3 h-3" /></button>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          const updated = scenes.filter((_, idx) => idx !== i)
                          updateNodeConfig(id, { scenes: updated })
                          if (activeScene >= updated.length) setActiveScene(Math.max(0, updated.length - 1))
                        }} className="p-1.5 bg-white/10 hover:bg-red-500/50 rounded-md text-white transition-colors" title="Delete"><Trash className="w-3 h-3" /></button>
                      </div>
                    )}
                    {/* Time badge */}
                    <div className="absolute bottom-1 left-1 text-[8px] bg-black/70 px-1 rounded text-white font-medium tabular-nums">0:{String(getSceneDuration(scene)).padStart(2, '0')}</div>
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
                    <div data-scene-ctx className="absolute top-8 right-2 w-28 bg-[#1a0d2e] border border-white/10 rounded-lg shadow-2xl z-50 p-1 overflow-hidden" onClick={e => e.stopPropagation()}>
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

        {/* Video Player Box */}
        <div className="flex-1 bg-black/40 rounded-xl border border-white/15 overflow-hidden relative shadow-2xl flex flex-col min-h-0">
          <div className="flex-1 w-full relative flex items-center justify-center min-h-0 overflow-hidden">
            {currentScene?.videoUrl ? (
              <video ref={videoRef} src={currentScene.videoUrl} loop muted={isMuted} className="w-full h-full object-contain" />
            ) : currentScene?.imageUrl ? (
              <img src={currentScene.imageUrl} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/20">
                <ImageIcon className="w-8 h-8" />
                <p className="text-xs">No media generated yet</p>
              </div>
            )}

            {/* Caption Overlay — word-synced */}
            {currentScene && config.captionStyle && config.captionStyle !== 'none' && currentScene.script && (isPlaying || currentScene.imageUrl) && (() => {
              const capStyle = filmCaptionStyles.find(c => c.id === config.captionStyle)
              if (!capStyle) return null
              const words = currentScene.script.split(' ')
              const sceneDur = getSceneDuration(currentScene)
              const sceneElapsed = currentTime - (sceneOffsets[activeScene] || 0)
              const wordsPerSec = words.length / Math.max(sceneDur, 1)
              const activeIdx = Math.min(Math.floor(sceneElapsed * wordsPerSec), words.length - 1)
              // Show chunk of ~5 words
              const chunkSize = 5
              const chunkStart = Math.max(0, Math.floor(activeIdx / chunkSize) * chunkSize)
              const chunk = words.slice(chunkStart, chunkStart + chunkSize)
              const displayChunk = capStyle.uppercase ? chunk.map(w => w.toUpperCase()) : chunk

              return (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none px-4">
                  {capStyle.bg && (
                    <div className="absolute inset-x-[15%] bottom-0 h-8 rounded" style={{ background: capStyle.bg }} />
                  )}
                  <span className="relative flex gap-1 flex-wrap justify-center" style={{ fontFamily: capStyle.font || 'inherit' }}>
                    {displayChunk.map((word, wi) => {
                      const globalIdx = chunkStart + wi
                      const isActive = globalIdx === activeIdx
                      return (
                        <span
                          key={`${chunkStart}-${wi}`}
                          className={`text-sm font-black transition-all duration-150 ${isActive ? 'scale-110' : ''}`}
                          style={{
                            color: isActive && capStyle.id === 'karaoke' ? '#ef4444' : (capStyle.color || '#fff'),
                            textShadow: capStyle.glow
                              ? `0 0 8px ${capStyle.color}, 0 0 16px ${capStyle.color}80`
                              : capStyle.outline
                                ? '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000'
                                : '0 2px 4px rgba(0,0,0,0.5)',
                            opacity: isActive ? 1 : 0.7,
                          }}
                        >
                          {word}
                        </span>
                      )
                    })}
                  </span>
                </div>
              )
            })()}

            {/* Scene indicator */}
            {scenes.length > 0 && (
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-white/70 font-medium">
                {activeScene + 1} / {scenes.length}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-white/5 cursor-pointer group/prog shrink-0 relative" onClick={handleSeek}>
            <div className="absolute inset-0 h-full transition-all group-hover/prog:h-1.5 group-hover/prog:-top-0.5" onClick={handleSeek}>
              {/* Filled */}
              <div className="h-full bg-[#f59e0b] rounded-r-full transition-all relative"
                style={{ width: totalDuration > 0 ? `${(currentTime / totalDuration) * 100}%` : '0%' }}>
                {/* Thumb */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover/prog:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="h-9 bg-[#1a0d2e] flex items-center px-3 gap-2 shrink-0">
            {/* Play/Pause */}
            <button
              onClick={() => {
                if (scenes.length === 0) return
                if (isPlaying) {
                  setIsPlaying(false)
                  videoRef.current?.pause()
                  sceneAudioRef.current?.pause()
                } else {
                  if (currentTime >= totalDuration) { setCurrentTime(0); setActiveScene(0) }
                  setIsPlaying(true)
                  videoRef.current?.play()
                  sceneAudioRef.current?.play()
                }
              }}
              className="text-white hover:text-[#f59e0b] transition-colors p-0.5"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            {/* Timecode */}
            <span className="text-[10px] text-zinc-400 font-medium tabular-nums">
              {formatTime(currentTime)} <span className="text-zinc-600">/</span> {formatTime(totalDuration)}
            </span>

            <div className="flex-1" />

            {/* Volume */}
            <div className="relative flex items-center">
              <button
                ref={volumeBtnRef}
                onClick={() => setIsMuted(m => !m)}
                className="text-zinc-400 hover:text-white transition-colors p-0.5"
                title={isMuted ? 'Unmute' : 'Mute'}
                onMouseEnter={() => setShowVolumeSlider(true)}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              {showVolumeSlider && (
                <div ref={volumePopupRef} className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1a0d2e] border border-white/10 rounded-lg shadow-2xl p-2 flex flex-col items-center gap-1"
                  onMouseLeave={() => setShowVolumeSlider(false)}>
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (v > 0) setIsMuted(false); else setIsMuted(true) }}
                    className="w-1.5 h-20 appearance-none cursor-pointer accent-[#f59e0b]"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  />
                  <span className="text-[8px] text-zinc-500 tabular-nums">{isMuted ? '0' : Math.round(volume * 100)}%</span>
                </div>
              )}
            </div>

            {/* 16:9 badge */}
            <span className="bg-white/5 px-1.5 py-0.5 rounded text-[9px] text-zinc-400 border border-white/10">16:9</span>

            {/* Fullscreen */}
            <button className="text-zinc-400 hover:text-white transition-colors p-0.5" title="Fullscreen"><Maximize2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>


        {/* Captions & Music toggles */}
        <div className="flex items-center gap-2 mt-3">
          {/* Captions button + popup */}
          <div className="relative">
            <button
              ref={captionsBtnRef}
              onClick={() => { setShowCaptionsPopup(v => !v); setShowMusicPopup(false) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors border ${config.captionStyle && config.captionStyle !== 'none' ? 'bg-[#D1FE17]/10 border-[#D1FE17]/30 text-[#D1FE17]' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'}`}
            >
              <FileText className="w-3 h-3" />
              {config.captionStyle && config.captionStyle !== 'none' ? filmCaptionStyles.find(c => c.id === config.captionStyle)?.label || 'Captions' : 'Captions'}
              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showCaptionsPopup ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showCaptionsPopup && (
                <motion.div ref={captionsPopupRef} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                  className="absolute z-50 bottom-full mb-1 left-0 w-56 bg-[#1a0d2e] border border-white/10 rounded-xl shadow-2xl p-2 origin-bottom-left"
                  onClick={e => e.stopPropagation()}>
                  <style>{`
                    @keyframes capGlow2 {
                      0%, 100% { filter: brightness(1); opacity: 0.85; }
                      50% { filter: brightness(2.2) saturate(1.5); opacity: 1; }
                    }
                    .cap-glow-anim2 { animation: capGlow2 1.6s ease-in-out infinite; }
                  `}</style>
                  <div className="text-[10px] font-bold text-white mb-2 ml-1">Captions</div>
                  <div className="grid grid-cols-3 gap-1.5 p-0.5">
                    {filmCaptionStyles.map(opt => (
                      <button key={opt.id}
                        onClick={() => { updateNodeConfig(id, { captionStyle: opt.id, captionsEnabled: opt.id !== 'none' }); setShowCaptionsPopup(false) }}
                        className={`group rounded-lg border transition-all overflow-hidden relative ${config.captionStyle === opt.id ? 'border-[#3b82f6] ring-1 ring-[#3b82f6]/50' : 'border-white/10 hover:border-white/30'}`}
                        style={{ height: 54 }}
                        title={opt.desc || opt.label}
                      >
                        {/* Background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-700/60 to-black/80" />
                        {opt.bg && <div className="absolute inset-x-3 bottom-2 h-4 rounded-sm" style={{ background: opt.bg }} />}
                        {/* Fake text lines */}
                        <div className="absolute inset-x-2 top-1.5 space-y-0.5 opacity-20">
                          <div className="h-0.5 bg-white/40 rounded-full w-3/4" />
                          <div className="h-0.5 bg-white/30 rounded-full w-1/2" />
                        </div>
                        {/* Caption label */}
                        <div className="absolute inset-x-0 bottom-1.5 flex justify-center px-1">
                          {opt.id === 'none' ? (
                            <span className="text-zinc-500 text-sm">⊘</span>
                          ) : (
                            <span className={`text-[7px] font-black text-center leading-tight ${opt.glow ? 'cap-glow-anim2' : ''}`}
                              style={{
                                color: opt.color,
                                fontFamily: opt.font || 'inherit',
                                textTransform: opt.uppercase ? 'uppercase' : 'none',
                                textShadow: opt.glow
                                  ? `0 0 6px ${opt.color}, 0 0 12px ${opt.color}80`
                                  : opt.outline
                                    ? `1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000`
                                    : 'none',
                              }}>
                              {opt.label}
                            </span>
                          )}
                        </div>
                        {/* Hover desc tooltip */}
                        {opt.desc && <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 z-10">
                          <span className="text-[6px] text-zinc-300 text-center leading-tight">{opt.desc}</span>
                        </div>}
                        {config.captionStyle === opt.id && (
                          <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-[#3b82f6] flex items-center justify-center z-20">
                            <Check className="w-1.5 h-1.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Music button + popup */}
          <div className="relative">
            <button
              ref={musicBtnRef}
              onClick={() => { setShowMusicPopup(v => !v); setShowCaptionsPopup(false) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors border ${config.musicTrack ? 'bg-[#a78bfa]/10 border-[#a78bfa]/30 text-[#a78bfa]' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'}`}
            >
              <Music className="w-3 h-3" />
              {config.musicTrack || 'Music'}
              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showMusicPopup ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showMusicPopup && (
                <motion.div ref={musicPopupRef} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                  className="absolute z-50 bottom-full mb-1 left-0 w-64 bg-[#1a0d2e] border border-white/10 rounded-xl shadow-2xl p-1 origin-bottom-left flex flex-col max-h-[260px]"
                  onClick={e => e.stopPropagation()}>
                  <div className="px-2 py-1.5 flex items-center gap-2 border-b border-white/10 shrink-0">
                    <Search className="w-3 h-3 text-zinc-400" />
                    <input type="text" placeholder="Search music" className="bg-transparent text-[10px] text-white outline-none w-full placeholder:text-zinc-500" />
                  </div>
                  <div className="flex gap-1 px-2 py-1.5 overflow-x-auto hide-scrollbar shrink-0 border-b border-white/5">
                    {['background', 'phonk', 'happy', 'cinematic'].map(t => (
                      <span key={t} className="px-2 py-0.5 bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white rounded text-[8px] font-medium whitespace-nowrap border border-white/10 transition-colors cursor-pointer">{t}</span>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto hide-scrollbar px-1 min-h-[100px]">
                    {/* None option */}
                    <div
                      onClick={() => { updateNodeConfig(id, { musicTrack: '' }); }}
                      className={`flex items-center gap-2.5 px-2 py-1.5 cursor-pointer rounded-lg transition-colors ${!config.musicTrack ? 'bg-white/5' : 'hover:bg-white/5'}`}
                    >
                      <div className="w-7 h-7 rounded border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                        <span className="text-zinc-500 text-xs">⊘</span>
                      </div>
                      <span className="text-[10px] text-zinc-300 font-medium">None</span>
                      {!config.musicTrack && <Check className="w-3 h-3 text-emerald-400 ml-auto" />}
                    </div>
                    {filmMusicOptions.map((opt, i) => {
                      const isSelected = config.musicTrack === opt.name
                      const currentVol = filmMusicVolume[opt.name] ?? -18.4
                      return (
                        <div key={i} className={`flex flex-col group p-1 ${isSelected ? 'bg-white/5 rounded-lg mb-0.5' : 'hover:bg-white/5 rounded-lg'}`}>
                          <div className="w-full flex items-center gap-2 px-1 py-1 cursor-pointer" onClick={() => updateNodeConfig(id, { musicTrack: opt.name })}>
                            <div className="relative w-7 h-7 rounded border border-white/5 overflow-hidden shrink-0" style={{ backgroundColor: `${opt.color}20` }}>
                              <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${filmPlayingPreview === opt.name ? 'opacity-0' : 'opacity-100'}`}>
                                <Music className="w-3.5 h-3.5" style={{ color: opt.color }} />
                              </div>
                              <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${filmPlayingPreview === opt.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                onClick={(e) => playFilmMusicPreview(opt.name, currentVol, e)}>
                                {filmPlayingPreview === opt.name ? (
                                  <Square className="w-3 h-3 fill-white text-white" />
                                ) : (
                                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] text-zinc-200 font-semibold truncate">{opt.name}</div>
                              <div className="text-[8px] text-zinc-500">{opt.duration} · {opt.author}</div>
                            </div>
                            <div className="shrink-0 w-7 flex justify-center">
                              {isSelected ? (
                                <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                  onClick={(e) => { e.stopPropagation(); updateNodeConfig(id, { musicTrack: opt.name }) }}>
                                  <Plus className="w-3.5 h-3.5 text-[#0ea5e9]" />
                                </div>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="mt-1 mb-0.5 px-2 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                              <Volume2 className="w-3 h-3 text-zinc-500 shrink-0" />
                              <input type="range" min="-40" max="0" step="0.1" value={currentVol}
                                onChange={(e) => {
                                  const db = parseFloat(e.target.value)
                                  setFilmMusicVolume(prev => ({ ...prev, [opt.name]: db }))
                                  if (filmPlayingPreview === opt.name && filmMasterGainRef.current) {
                                    filmMasterGainRef.current.gain.value = Math.pow(10, db / 20)
                                  }
                                }}
                                className="flex-1 h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer" />
                              <span className="text-[7px] font-bold text-[#D1FE17] bg-white/5 px-1 py-0.5 rounded tabular-nums min-w-[24px] text-center">{currentVol.toFixed(1)}</span>
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

        {/* Footer actions */}
        <div className="mt-3 space-y-2">
          {/* Export progress */}
          {isExporting && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#f59e0b] rounded-full transition-all" style={{ width: `${exportProgress}%` }} />
              </div>
              <span className="text-[9px] text-zinc-400 tabular-nums">{exportProgress}%</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            {/* Download exported video */}
            {exportedVideoUrl && !isExporting && (
              <a
                href={exportedVideoUrl}
                download="creavidy-video.webm"
                className="px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-colors flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            )}

            {/* Export Video — client-side composition */}
            <button
              disabled={isExporting || isGeneratingMedia || scenes.length === 0 || !scenes.some(s => s.imageUrl)}
              className="px-5 py-2 rounded-lg bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-xs font-semibold text-[#f59e0b] transition-colors disabled:opacity-50 flex items-center gap-2"
              onClick={async () => {
                const scenesWithImages = scenes.filter(s => s.imageUrl)
                if (scenesWithImages.length === 0) { toast.error('Generate images first'); return }

                setIsExporting(true)
                setExportProgress(0)
                updateNodeConfig(id, { generationPhase: 'exporting' })
                const toastId = toast.loading('Composing video...')

                try {
                  const captionStyleObj = filmCaptionStyles.find(c => c.id === config.captionStyle) as CaptionStyle | undefined
                  const result = await composeVideo({
                    scenes: scenes.map(s => ({
                      imageUrl: s.imageUrl!,
                      audioUrl: s.audioUrl,
                      script: s.script,
                      duration: getSceneDuration(s),
                    })),
                    captionStyle: captionStyleObj && captionStyleObj.id !== 'none' ? captionStyleObj : undefined,
                    onProgress: (pct) => setExportProgress(pct),
                  })

                  setExportedVideoUrl(result.url)
                  updateNodeConfig(id, { exportedVideoUrl: result.url, generationPhase: 'done' })
                  toast.success(`Video ready! (${Math.round(result.duration)}s)`, { id: toastId })

                  // Auto-download
                  const a = document.createElement('a')
                  a.href = result.url
                  a.download = 'creavidy-video.webm'
                  a.click()
                } catch (e: any) {
                  toast.error(`Export failed: ${e.message}`, { id: toastId })
                  updateNodeConfig(id, { generationPhase: 'done' })
                } finally {
                  setIsExporting(false)
                }
              }}
            >
              {isExporting
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Exporting...</>
                : <><Film className="w-3.5 h-3.5" /> Export Video</>
              }
            </button>

            {/* AI Video Generation — premium per-scene */}
            <button
              disabled={isGeneratingMedia || isExporting || scenes.length === 0}
              className="px-3 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-[10px] font-medium text-purple-300/70 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              title="Generate AI video clips per scene (premium)"
              onClick={async () => {
                setIsGeneratingMedia(true)
                const updatedScenes = [...scenes]
                for (let i = 0; i < updatedScenes.length; i++) {
                  const s = updatedScenes[i]
                  if (s.videoUrl) continue
                  const videoModel = s.imageUrl ? 'kling-3.0-standard-i2v' : 'kling-3.0-standard-t2v'
                  const tid = toast.loading(`Scene ${i + 1}: AI video...`)
                  try {
                    const r = await fetch('/api/generate/video', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ model: videoModel, prompt: s.description, imageUrl: s.imageUrl || undefined, duration: getSceneDuration(s) }),
                    })
                    const d = await r.json()
                    if (d.videoUrl) {
                      updatedScenes[i] = { ...s, videoUrl: d.videoUrl }
                      updateNodeConfig(id, { scenes: [...updatedScenes] })
                      toast.success(`Scene ${i + 1} done`, { id: tid })
                    } else {
                      toast.error(`Scene ${i + 1}: ${d.error || 'failed'}`, { id: tid })
                    }
                  } catch (e: any) {
                    toast.error(`Scene ${i + 1}: ${e.message}`, { id: tid })
                  }
                }
                setIsGeneratingMedia(false)
              }}
            >
              {isGeneratingMedia
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                : <><Zap className="w-3 h-3" /> AI Videos</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {/* Media Modal (Replace/Generate) — fixed fullscreen overlay */}
        {showMediaModal !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[200] bg-white rounded-xl overflow-hidden flex flex-col nowheel">
              {/* Tab Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 shrink-0">
                <div className="flex gap-1">
                  {([['your', 'Your media'], ['stock', 'Stock media'], ['ai', 'AI media']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setMediaTab(key)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${mediaTab === key ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowMediaModal(null)} className="p-1.5 hover:bg-zinc-100 rounded-full transition-colors"><X className="w-4 h-4 text-zinc-400" /></button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 flex overflow-hidden min-h-0">

                {/* ── AI Media Tab ── */}
                {mediaTab === 'ai' && (<>
                  {/* Left controls */}
                  <div className="w-[280px] border-r border-zinc-100 flex flex-col overflow-hidden min-h-0">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 hide-scrollbar" onWheel={(e) => e.stopPropagation()}>
                      {/* Prompt */}
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Prompt</label>
                        <textarea value={mediaPrompt} onChange={(e) => setMediaPrompt(e.target.value)}
                          className="w-full h-24 bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-[11px] text-zinc-700 resize-none focus:outline-none focus:border-[#00B5CF] transition-colors" />
                      </div>

                      {/* Visual Style Grid */}
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Visual Style</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {/* None option */}
                          <button onClick={() => setMediaStyle('')}
                            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-all ${!mediaStyle ? 'border-[#00B5CF] bg-[#00B5CF]/5' : 'border-zinc-100 hover:border-zinc-200'}`}>
                            <div className={`w-full aspect-square rounded-md flex items-center justify-center text-lg bg-zinc-50 ${!mediaStyle ? 'ring-1 ring-[#00B5CF]' : ''}`}>🚫</div>
                            <span className="text-[8px] text-zinc-500 truncate w-full text-center">None</span>
                          </button>
                          {mediaStyleOptions.map(s => (
                            <button key={s.id} onClick={() => setMediaStyle(s.label)}
                              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-all ${mediaStyle === s.label ? 'border-[#00B5CF] bg-[#00B5CF]/5' : 'border-zinc-100 hover:border-zinc-200'}`}>
                              <div className={`w-full aspect-square rounded-md bg-gradient-to-br ${s.gradient} flex items-center justify-center text-lg ${mediaStyle === s.label ? 'ring-1 ring-[#00B5CF]' : ''}`}>{s.emoji}</div>
                              <span className="text-[8px] text-zinc-500 truncate w-full text-center">{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Scene media type */}
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Scene media</label>
                        <div className="flex gap-1.5">
                          <button onClick={() => setMediaType('image')}
                            className={`flex-1 py-2 text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors ${mediaType === 'image' ? 'border border-[#00B5CF] text-[#00B5CF] bg-[#00B5CF]/10' : 'border border-zinc-200 text-zinc-400 hover:text-zinc-600'}`}>
                            <ImageIcon className="w-3 h-3" /> Images
                          </button>
                          <button onClick={() => setMediaType('video')}
                            className={`flex-1 py-2 text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors ${mediaType === 'video' ? 'border border-[#00B5CF] text-[#00B5CF] bg-[#00B5CF]/10' : 'border border-zinc-200 text-zinc-400 hover:text-zinc-600'}`}>
                            <MonitorPlay className="w-3 h-3" /> Video clips
                          </button>
                        </div>
                      </div>

                      {/* Aspect ratio */}
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Aspect ratio</label>
                        <div className="flex gap-1.5">
                          <button onClick={() => setMediaRatio('16:9')}
                            className={`flex-1 py-2 text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors ${mediaRatio === '16:9' ? 'border border-[#00B5CF] text-[#00B5CF] bg-[#00B5CF]/10' : 'border border-zinc-200 text-zinc-400 hover:text-zinc-600'}`}>
                            <MonitorPlay className="w-3 h-3" /> 16:9
                          </button>
                          <button onClick={() => setMediaRatio('9:16')}
                            className={`flex-1 py-2 text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors ${mediaRatio === '9:16' ? 'border border-[#00B5CF] text-[#00B5CF] bg-[#00B5CF]/10' : 'border border-zinc-200 text-zinc-400 hover:text-zinc-600'}`}>
                            <MonitorPlay className="w-3 h-3" /> 9:16
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Generate button - pinned bottom */}
                    <div className="p-4 border-t border-zinc-100 shrink-0">
                      <button
                        disabled={isGeneratingPreview}
                        onClick={async () => {
                          setIsGeneratingPreview(true)
                          setGeneratedPreview(null)
                          try {
                            const prompt = mediaStyle ? `${mediaPrompt}, ${mediaStyle} style, cinematic` : mediaPrompt
                            const r = await fetch('/api/generate/image', {
                              method: 'POST', headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ model: 'flux-schnell', prompt, width: mediaRatio === '16:9' ? 1280 : 720, height: mediaRatio === '16:9' ? 720 : 1280 }),
                            })
                            const d = await r.json()
                            if (d.imageUrl) setGeneratedPreview(d.imageUrl)
                            else toast.error(d.error || 'Generation failed')
                          } catch (e: any) { toast.error(e.message) }
                          setIsGeneratingPreview(false)
                        }}
                        className="w-full py-2.5 bg-[#00B5CF] hover:bg-[#009ab0] text-white font-bold rounded-lg text-xs transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                        {isGeneratingPreview ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : 'Generate'}
                      </button>
                    </div>
                  </div>

                  {/* Right preview */}
                  <div className="flex-1 bg-zinc-50 flex flex-col">
                    <div className="flex-1 flex items-center justify-center p-6">
                      <div className={`w-full max-w-lg bg-black rounded-xl overflow-hidden shadow-xl relative flex items-center justify-center ${mediaRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] max-h-[70%]'}`}>
                        {generatedPreview ? (
                          <img src={generatedPreview} alt="Generated" className="w-full h-full object-cover" />
                        ) : scenes[showMediaModal]?.imageUrl ? (
                          <img src={scenes[showMediaModal].imageUrl} alt="Current" className="w-full h-full object-cover opacity-40" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-zinc-500">
                            <ImageIcon className="w-10 h-10" />
                            <p className="text-[10px]">Generate a new image</p>
                          </div>
                        )}
                        {!generatedPreview && scenes[showMediaModal]?.imageUrl && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] text-white bg-black/60 px-3 py-1 rounded-full">Current image</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Apply button */}
                    {generatedPreview && (
                      <div className="px-6 pb-4 flex gap-2 shrink-0">
                        <button onClick={() => setGeneratedPreview(null)}
                          className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-lg text-xs hover:bg-zinc-100 transition-colors">
                          Discard
                        </button>
                        <button onClick={() => {
                          const updated = [...scenes]
                          updated[showMediaModal] = { ...updated[showMediaModal], imageUrl: generatedPreview }
                          updateNodeConfig(id, { scenes: updated })
                          toast.success('Image applied to scene')
                          setShowMediaModal(null)
                        }}
                          className="flex-1 py-2.5 bg-[#00B5CF] hover:bg-[#009ab0] text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> Apply to Scene
                        </button>
                      </div>
                    )}
                  </div>
                </>)}

                {/* ── Stock Media Tab ── */}
                {mediaTab === 'stock' && (
                  <div className="flex-1 flex flex-col p-6">
                    <div className="flex gap-2 mb-4">
                      <div className="flex-1 relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input type="text" placeholder="Search stock images & videos..." value={stockSearch} onChange={(e) => setStockSearch(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-3 py-2.5 text-xs text-zinc-700 focus:outline-none focus:border-[#00B5CF] transition-colors" />
                      </div>
                      <button className="px-4 py-2.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors">Search</button>
                    </div>
                    <div className="flex gap-2 mb-4">
                      {['Nature', 'Business', 'Technology', 'People', 'Food', 'Abstract'].map(tag => (
                        <button key={tag} className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-full text-[10px] text-zinc-600 font-medium transition-colors">{tag}</button>
                      ))}
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2 overflow-y-auto custom-scrollbar">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="aspect-video bg-zinc-100 rounded-lg overflow-hidden relative group cursor-pointer hover:ring-2 hover:ring-[#00B5CF] transition-all">
                          <img src={`https://picsum.photos/seed/stock${i + 1}/400/225`} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <button onClick={() => {
                              const url = `https://picsum.photos/seed/stock${i + 1}/1280/720`
                              const updated = [...scenes]
                              updated[showMediaModal] = { ...updated[showMediaModal], imageUrl: url }
                              updateNodeConfig(id, { scenes: updated })
                              toast.success('Stock image applied')
                              setShowMediaModal(null)
                            }}
                              className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-white text-black text-[10px] font-bold rounded-lg shadow-lg transition-opacity">
                              Use this
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Your Media Tab ── */}
                {mediaTab === 'your' && (
                  <div className="flex-1 flex flex-col p-6">
                    {/* Hidden file input */}
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden"
                      onChange={(e) => {
                        const files = e.target.files
                        if (!files) return
                        Array.from(files).forEach(file => {
                          const url = URL.createObjectURL(file)
                          setUploadedMedia(prev => [...prev, { url, name: file.name }])
                        })
                        e.target.value = ''
                        toast.success(`${files.length} file(s) added`)
                      }} />
                    <div className="flex gap-2 mb-4">
                      <div className="flex-1 relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input type="text" placeholder="Search your uploads..." className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-3 py-2.5 text-xs text-zinc-700 focus:outline-none focus:border-[#00B5CF] transition-colors" />
                      </div>
                      <button onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 bg-[#00B5CF] text-white text-xs font-semibold rounded-lg hover:bg-[#009ab0] transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" /> Upload
                      </button>
                    </div>
                    <div className="flex gap-2 mb-4">
                      {['All', 'Images', 'Videos', 'Recent'].map((tab, idx) => (
                        <button key={tab} className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors ${idx === 0 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'}`}>{tab}</button>
                      ))}
                    </div>
                    {/* Uploaded + scene images combined */}
                    {(() => {
                      const allMedia = [
                        ...uploadedMedia.map((m, i) => ({ url: m.url, label: m.name, key: `upload-${i}` })),
                        ...scenes.filter(s => s.imageUrl).map((s, i) => ({ url: s.imageUrl!, label: `Scene ${i + 1}`, key: s.id || `scene-${i}` })),
                      ]
                      if (allMedia.length === 0) return (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="w-10 h-10 mb-3 text-zinc-300" />
                          <p className="text-sm font-medium text-zinc-500">No media yet</p>
                          <p className="text-[10px] text-zinc-400 mt-1">Click to upload images or videos</p>
                        </div>
                      )
                      return (
                        <div className="flex-1 grid grid-cols-3 gap-2 overflow-y-auto custom-scrollbar">
                          {allMedia.map(m => (
                            <div key={m.key} className="aspect-video bg-zinc-100 rounded-lg overflow-hidden relative group cursor-pointer hover:ring-2 hover:ring-[#00B5CF] transition-all">
                              <img src={m.url} alt={m.label} className="w-full h-full object-cover" />
                              <div className="absolute bottom-1 left-1 text-[8px] bg-black/60 text-white px-1.5 py-0.5 rounded max-w-[80%] truncate">{m.label}</div>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <button onClick={() => {
                                  const updated = [...scenes]
                                  updated[showMediaModal] = { ...updated[showMediaModal], imageUrl: m.url }
                                  updateNodeConfig(id, { scenes: updated })
                                  toast.success('Image applied')
                                  setShowMediaModal(null)
                                }}
                                  className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-white text-black text-[10px] font-bold rounded-lg shadow-lg transition-opacity">
                                  Use this
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                )}

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

      </AnimatePresence>

    </motion.div>
    </div>
  )
})
FilmStripNodeContent.displayName = 'FilmStripNode'

