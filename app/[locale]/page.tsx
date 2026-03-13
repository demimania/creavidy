"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatedGradientButton } from "@/components/ui/animated-gradient-button";
import Particles from "@/components/ui/particles";
import { SplineScene } from "@/components/ui/spline-scene";
import GlobalSpotlight from "@/components/ui/global-spotlight";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight, Play, Sparkles, Video, Wand2, Layers, Zap,
    Image as ImageIcon, Film, Mic, Settings, Upload, ChevronDown,
    CreditCard, User, Palette, RefreshCw, Plus, Ban, ChevronRight
} from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { CosmosFooter } from "@/components/ui/cosmos-footer";
import { useProjectStore } from "@/lib/stores/project-store";

// Style options — synced with workspace VideoBrief node (47 styles)
const STYLES = [
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

// Voice options — synced with workspace VideoBrief narratorOptions (20 voices)
const VOICES = [
    { id: "fable",   name: "Ms. Labebe",     type: "voice" as const, gender: "Female",  accent: "British",  avatar: "👩", color: "from-pink-400 to-rose-500" },
    { id: "nova",    name: "Lady Holiday",   type: "voice" as const, gender: "Female",  accent: "American", avatar: "👩", color: "from-rose-400 to-pink-500" },
    { id: "echo",    name: "Happy Dino",     type: "voice" as const, gender: "Male",    accent: "American", avatar: "🦕", color: "from-purple-400 to-pink-500" },
    { id: "alloy",   name: "Jolly Yapper",   type: "voice" as const, gender: "Female",  accent: "American", avatar: "🎤", color: "from-amber-400 to-orange-500" },
    { id: "alloy",   name: "Game Host",      type: "voice" as const, gender: "Male",    accent: "American", avatar: "🎙️", color: "from-blue-400 to-indigo-500" },
    { id: "onyx",    name: "Calm Narrator",  type: "voice" as const, gender: "Male",    accent: "American", avatar: "🎭", color: "from-emerald-400 to-teal-500" },
    { id: "shimmer", name: "Cheerful Girl",  type: "voice" as const, gender: "Female",  accent: "American", avatar: "😊", color: "from-yellow-400 to-amber-500" },
    { id: "onyx",    name: "Quiet Man",      type: "voice" as const, gender: "Male",    accent: "American", avatar: "😐", color: "from-gray-400 to-zinc-500" },
    { id: "echo",    name: "Brave Guy",      type: "voice" as const, gender: "Male",    accent: "American", avatar: "💪", color: "from-red-400 to-orange-500" },
    { id: "shimmer", name: "ASMR Vlogger",   type: "voice" as const, gender: "Female",  accent: "American", avatar: "🎧", color: "from-violet-400 to-purple-500" },
    { id: "fable",   name: "Snarky Critic",  type: "voice" as const, gender: "Male",    accent: "British",  avatar: "😏", color: "from-stone-400 to-gray-500" },
    { id: "nova",    name: "Spooky Witch",   type: "voice" as const, gender: "Female",  accent: "British",  avatar: "🧙", color: "from-purple-500 to-indigo-600" },
    { id: "alloy",   name: "Sports Caster",  type: "voice" as const, gender: "Male",    accent: "American", avatar: "⚽", color: "from-green-400 to-emerald-500" },
    { id: "onyx",    name: "Cool & Calm",    type: "voice" as const, gender: "Male",    accent: "American", avatar: "😎", color: "from-cyan-400 to-blue-500" },
    { id: "shimmer", name: "Sweet Kid",      type: "voice" as const, gender: "Neutral", accent: "American", avatar: "👦", color: "from-sky-300 to-blue-400" },
    { id: "onyx",    name: "Professor",      type: "voice" as const, gender: "Male",    accent: "British",  avatar: "🎓", color: "from-amber-400 to-orange-500" },
    { id: "nova",    name: "Diva Queen",     type: "voice" as const, gender: "Female",  accent: "American", avatar: "💅", color: "from-pink-500 to-rose-600" },
    { id: "fable",   name: "Storyteller",    type: "voice" as const, gender: "Male",    accent: "British",  avatar: "📖", color: "from-teal-400 to-emerald-500" },
    { id: "shimmer", name: "Excited Woman",  type: "voice" as const, gender: "Female",  accent: "American", avatar: "😄", color: "from-yellow-400 to-orange-500" },
    { id: "echo",    name: "Robot Voice",    type: "voice" as const, gender: "Neutral", accent: "American", avatar: "🤖", color: "from-zinc-400 to-gray-600" },
];

// Inspiration prompts
const INSPIRATIONS = [
    { title: "🏙️ Rooftop sunset timelapse", prompt: "A cinematic timelapse of a city skyline at sunset, warm golden light fading to deep blue, with ambient electronic music and smooth camera movement" },
    { title: "🚀 SaaS product demo", prompt: "A sleek, modern product demo video for a design tool, showing UI interactions with smooth transitions and a professional narrator" },
    { title: "📱 Social media ad", prompt: "A 15-second vertical ad for a fitness app, fast-paced cuts between workout scenes, bold text overlays, and energetic background music" },
    { title: "🎨 Brand story", prompt: "A 60-second brand story for a sustainable fashion startup, showing the journey from raw materials to finished product with warm, earthy tones" },
    { title: "🦸 CEOs as superheroes", prompt: "What if famous tech CEOs were superheroes? Create an animated short showing each CEO with unique superpowers matching their company's mission" },
    { title: "🔥 Cleopatra's power", prompt: "Avatar explains the power and legacy of Cleopatra through cinematic narration with epic visuals and dramatic music" },
    { title: "🧠 AI tools for beginners", prompt: "Educational video explaining the top AI tools for beginners, with screen recordings, animated icons, and a friendly voiceover" },
    { title: "🌍 Travel vlog intro", prompt: "A stunning 15-second travel vlog intro with drone footage, cinematic color grading, and upbeat background music" },
    { title: "🎮 Game trailer", prompt: "An epic game trailer with dramatic camera angles, particle effects, slow motion combat scenes and orchestral music" },
    { title: "🍳 Recipe tutorial", prompt: "A fast-paced overhead recipe video showing step-by-step cooking with smooth transitions, ingredient callouts, and relaxing background music" },
];

export default function LandingPage() {
    const router = useRouter();
    const { prompt, setPrompt, style, setStyle, voice, setVoice, duration, setDuration, aspectRatio, setAspectRatio, setCurrentStep } = useProjectStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Dropdown states
    const [showStyleDropdown, setShowStyleDropdown] = useState(false);
    const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [voiceTab, setVoiceTab] = useState<"voice" | "avatars">("voice");
    const styleScrollRef = useRef<HTMLDivElement>(null);
    const [inspirationOffset, setInspirationOffset] = useState(0);
    const visibleInspirations = INSPIRATIONS.slice(inspirationOffset, inspirationOffset + 3).length === 3
        ? INSPIRATIONS.slice(inspirationOffset, inspirationOffset + 3)
        : INSPIRATIONS.slice(0, 3);
    const shuffleInspirations = () => {
        const next = inspirationOffset + 3;
        setInspirationOffset(next >= INSPIRATIONS.length ? 0 : next);
    };

    // Close dropdowns on outside click
    const closeAllDropdowns = useCallback(() => {
        setShowStyleDropdown(false);
        setShowVoiceDropdown(false);
        setShowSettingsDropdown(false);
    }, []);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest("[data-dropdown]")) {
                closeAllDropdowns();
            }
        };
        // Use capture phase to ensure we catch all clicks
        document.addEventListener("mousedown", handleClick, true);
        return () => document.removeEventListener("mousedown", handleClick, true);
    }, [closeAllDropdowns]);

    const selectedStyle = STYLES.find(s => s.id === style) || STYLES[0];

    const handleCreate = () => {
        if (!prompt.trim()) return;
        setCurrentStep("chat");
        const params = new URLSearchParams({
            prompt: prompt.trim(),
            mode: 'video',
            style: selectedStyle.label,
            narrator: voice?.name || '',
            duration: String(duration),
            aspect: aspectRatio,
        });
        router.push(`/workspace/new?${params.toString()}`);
    };


    const handleInspirationClick = (inspirationPrompt: string) => {
        setPrompt(inspirationPrompt);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#0F051D] text-white selection:bg-[#D1FE17] selection:text-black font-sans">

            <GlobalSpotlight />

            {/* Navbar */}
            <nav className="fixed top-0 z-[9999] w-full border-b border-white/5 bg-[#0F051D]/80 backdrop-blur-md pointer-events-auto">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.svg" alt="Creavidy" className="h-8" />
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
                        <Link href="/pricing" className="hover:text-white transition-colors flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Pricing
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <Link href="/auth/sign-in">
                            <span className="text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer">
                                Log in
                            </span>
                        </Link>
                        <button
                            onClick={() => router.push("/auth/sign-up")}
                            className="h-8 px-4 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center cursor-pointer z-50"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section — Prompt + 3D Robot */}
            <section className="relative pt-20 pb-10 md:pt-24 md:pb-14 overflow-hidden">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">

                        {/* LEFT: Prompt Area */}
                        <div className="flex-1 max-w-2xl w-full">
                            {/* AI Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex items-center gap-3 mb-5"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.08, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative flex items-center justify-center"
                                >
                                    <div className="absolute inset-0 bg-[#a78bfa]/30 blur-xl rounded-full scale-150" />
                                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#a78bfa] to-[#06d6a0] flex items-center justify-center">
                                        <Wand2 className="w-5 h-5 text-white" />
                                    </div>
                                </motion.div>
                                <div className="flex flex-col">
                                    <span className="text-[#a78bfa] text-[10px] font-black tracking-[0.2em] uppercase">AI-Powered</span>
                                    <span className="text-white text-xs font-bold tracking-wide">Video Creation Platform</span>
                                </div>
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.08] mb-3"
                            >
                                Describe It. {" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D1FE17] to-[#a8d911]">
                                    AI Creates It.
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.15 }}
                                className="text-sm md:text-base text-zinc-500 mb-6 leading-relaxed max-w-lg"
                            >
                                Chat with AI, generate scenes with any model, and export professional videos — all from one platform.
                            </motion.p>

                            {/* Prompt Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="relative z-40 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 md:p-6 shadow-[0_0_50px_rgba(167,139,250,0.15)] ring-1 ring-white/10"
                            >
                                {/* Textarea */}
                                <div className="relative mb-4">
                                    <textarea
                                        ref={textareaRef}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe your video idea..."
                                        maxLength={2000}
                                        rows={3}
                                        className="w-full bg-transparent border-none px-1 py-2 text-white placeholder:text-zinc-600 focus:outline-none resize-none text-sm leading-relaxed"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                </div>

                                {/* Control Row + Create Button */}
                                <div className="flex items-center gap-2">
                                    {/* Controls Left */}
                                    <div className="flex flex-wrap items-center gap-1.5 flex-1">
                                        {/* Upload Reference */}
                                        <button className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all">
                                            <Plus className="w-4 h-4" />
                                        </button>

                                        {/* Style Selector */}
                                        <div className="relative" data-dropdown>
                                            <button
                                                onClick={() => { setShowStyleDropdown(!showStyleDropdown); setShowVoiceDropdown(false); setShowSettingsDropdown(false); }}
                                                className={`flex items-center gap-2 px-3.5 h-9 rounded-xl border text-xs transition-all ${showStyleDropdown ? "bg-white/10 border-white/25 text-white" : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:border-white/20"}`}
                                            >
                                                <Palette className="w-3.5 h-3.5 text-zinc-500" />
                                                <span>{style ? selectedStyle.label : "Style"}</span>
                                                <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${showStyleDropdown ? "rotate-180" : ""}`} />
                                            </button>
                                            <AnimatePresence>
                                                {showStyleDropdown && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 8 }}
                                                        className="absolute top-full mt-2 left-0 bg-[#1a1025]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 z-50 shadow-2xl"
                                                        style={{ width: "max(420px, 100%)" }}
                                                    >
                                                        <p className="text-xs font-semibold text-zinc-300 mb-3">Style</p>
                                                        <div className="relative">
                                                            <div ref={styleScrollRef} className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                                                                {/* None option */}
                                                                <button
                                                                    onClick={() => { setStyle(""); setShowStyleDropdown(false); }}
                                                                    className={`flex-shrink-0 flex flex-col items-center gap-2 group`}
                                                                >
                                                                    <div className={`w-[72px] h-[90px] rounded-xl border-2 flex items-center justify-center transition-all ${!style ? "border-[#a78bfa] bg-white/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                                                                        <Ban className="w-5 h-5 text-zinc-500" />
                                                                    </div>
                                                                    <span className="text-[10px] text-zinc-400 w-[72px] text-center truncate">None</span>
                                                                </button>
                                                                {STYLES.map(s => (
                                                                    <button
                                                                        key={s.id}
                                                                        onClick={() => { setStyle(s.id); setShowStyleDropdown(false); }}
                                                                        className="flex-shrink-0 flex flex-col items-center gap-2 group"
                                                                    >
                                                                        <div className={`w-[72px] h-[90px] rounded-xl border-2 overflow-hidden transition-all ${style === s.id ? "border-[#a78bfa] ring-1 ring-[#a78bfa]/30" : "border-transparent hover:border-white/20"}`}>
                                                                            <div className={`w-full h-full bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl`}>
                                                                                {s.emoji}
                                                                            </div>
                                                                        </div>
                                                                        <span className={`text-[10px] w-[72px] text-center truncate ${style === s.id ? "text-white font-medium" : "text-zinc-400"}`}>{s.label}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            {/* Scroll arrow */}
                                                            <button
                                                                onClick={() => styleScrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
                                                                className="absolute right-0 top-0 h-[90px] w-8 flex items-center justify-center bg-gradient-to-l from-[#1a1025] to-transparent"
                                                            >
                                                                <ChevronRight className="w-4 h-4 text-zinc-400" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Voice Selector */}
                                        <div className="relative" data-dropdown>
                                            <button
                                                onClick={() => { setShowVoiceDropdown(!showVoiceDropdown); setShowStyleDropdown(false); setShowSettingsDropdown(false); }}
                                                className={`flex items-center gap-2 px-3.5 h-9 rounded-xl border text-xs transition-all ${showVoiceDropdown ? "bg-white/10 border-white/25 text-white" : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:border-white/20"}`}
                                            >
                                                <Mic className="w-3.5 h-3.5 text-zinc-500" />
                                                <span>{voice ? voice.name : "Voice"}</span>
                                                <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${showVoiceDropdown ? "rotate-180" : ""}`} />
                                            </button>
                                            <AnimatePresence>
                                                {showVoiceDropdown && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 8 }}
                                                        className="absolute top-full mt-2 left-0 bg-[#1a1025]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 z-50 shadow-2xl"
                                                        style={{ width: "420px" }}
                                                    >
                                                        {/* Tabs */}
                                                        <div className="flex gap-4 mb-4">
                                                            <button
                                                                onClick={() => setVoiceTab("voice")}
                                                                className={`text-xs font-semibold pb-1 border-b-2 transition-all ${voiceTab === "voice" ? "text-white border-[#a78bfa]" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}
                                                            >
                                                                Voice
                                                            </button>
                                                            <button
                                                                onClick={() => setVoiceTab("avatars")}
                                                                className={`text-xs font-semibold pb-1 border-b-2 transition-all ${voiceTab === "avatars" ? "text-white border-[#a78bfa]" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}
                                                            >
                                                                Avatars
                                                            </button>
                                                        </div>

                                                        {voiceTab === "voice" && (
                                                            <div className="grid grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                                                                {/* None option */}
                                                                <button
                                                                    onClick={() => { setVoice(null as any); setShowVoiceDropdown(false); }}
                                                                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${!voice ? "border-[#a78bfa] bg-white/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}
                                                                >
                                                                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                                                        <Ban className="w-4 h-4 text-zinc-500" />
                                                                    </div>
                                                                    <span className="text-[11px] text-zinc-400 truncate">None</span>
                                                                </button>
                                                                {VOICES.map(v => (
                                                                    <button
                                                                        key={v.name}
                                                                        onClick={() => { setVoice(v); setShowVoiceDropdown(false); }}
                                                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${voice?.name === v.name ? "border-[#a78bfa] bg-white/10" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"}`}
                                                                    >
                                                                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${v.color} flex items-center justify-center text-lg flex-shrink-0`}>
                                                                            {v.avatar}
                                                                        </div>
                                                                        <span className={`text-[11px] truncate ${voice?.name === v.name ? "text-white font-medium" : "text-zinc-300"}`}>{v.name}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {voiceTab === "avatars" && (
                                                            <div className="text-center py-6">
                                                                <User className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                                                <p className="text-zinc-500 text-xs">AI avatars coming soon</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Settings */}
                                        <div className="relative" data-dropdown>
                                            <button
                                                onClick={() => { setShowSettingsDropdown(!showSettingsDropdown); setShowStyleDropdown(false); setShowVoiceDropdown(false); }}
                                                className={`flex items-center gap-2 px-3.5 h-9 rounded-xl border text-xs transition-all ${showSettingsDropdown ? "bg-white/10 border-white/25 text-white" : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:border-white/20"}`}
                                            >
                                                <Settings className="w-3.5 h-3.5 text-zinc-500" />
                                                <span>{duration >= 60 ? `${Math.round(duration / 60)} min` : `${duration}s`} · {aspectRatio}</span>
                                                <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${showSettingsDropdown ? "rotate-180" : ""}`} />
                                            </button>
                                            <AnimatePresence>
                                                {showSettingsDropdown && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 8 }}
                                                        className="absolute top-full mt-2 right-0 bg-[#1a1025]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 z-50 w-[340px] shadow-2xl space-y-4"
                                                    >
                                                        {/* Duration */}
                                                        <div>
                                                            <label className="text-xs font-semibold text-zinc-300 mb-2.5 block">Duration</label>
                                                            <div className="flex gap-2">
                                                                {[{ val: 60, label: "1 min" }, { val: 180, label: "3 min" }, { val: 300, label: "5 min" }, { val: 600, label: "10 min" }].map(d => (
                                                                    <button
                                                                        key={d.val}
                                                                        onClick={() => setDuration(d.val)}
                                                                        className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${duration === d.val
                                                                            ? "bg-[#D1FE17]/10 border-[#D1FE17]/50 text-[#D1FE17]"
                                                                            : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                                                                            }`}
                                                                    >
                                                                        {d.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {/* Aspect Ratio */}
                                                        <div>
                                                            <label className="text-xs font-semibold text-zinc-300 mb-2.5 block">Aspect Ratio</label>
                                                            <div className="flex gap-2">
                                                                {["16:9", "9:16"].map(r => (
                                                                    <button
                                                                        key={r}
                                                                        onClick={() => setAspectRatio(r)}
                                                                        className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${aspectRatio === r
                                                                            ? "bg-[#D1FE17]/10 border-[#D1FE17]/50 text-[#D1FE17]"
                                                                            : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                                                                            }`}
                                                                    >
                                                                        {r}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Create Button — inline right */}
                                    <button
                                        onClick={handleCreate}
                                        className="flex-shrink-0 h-10 px-5 rounded-xl bg-[#D1FE17] text-black font-bold text-xs flex items-center gap-2 hover:bg-[#c8f010] transition-all group shadow-lg shadow-[#D1FE17]/20 cursor-pointer"
                                    >
                                        <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                                        Create
                                    </button>
                                </div>
                            </motion.div>

                            {/* Inspiration Chips */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.35 }}
                                className="mt-4 flex items-stretch gap-2"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={inspirationOffset}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.25 }}
                                        className="flex-1 grid grid-cols-3 gap-2"
                                    >
                                        {visibleInspirations.map((item, i) => (
                                            <button
                                                key={`${inspirationOffset}-${i}`}
                                                onClick={() => handleInspirationClick(item.prompt)}
                                                className="text-left p-3 rounded-2xl bg-white/[0.04] border border-white/8 hover:border-[#a78bfa]/30 hover:bg-white/[0.07] transition-all group flex items-start gap-2"
                                            >
                                                <span className="flex-1 text-[11px] text-zinc-400 group-hover:text-zinc-200 leading-snug transition-colors line-clamp-2">{item.title}</span>
                                                <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 flex-shrink-0 mt-0.5 -rotate-45 group-hover:rotate-0 transition-all" />
                                            </button>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Refresh Button */}
                                <button
                                    onClick={shuffleInspirations}
                                    className="flex-shrink-0 flex items-center justify-center w-10 rounded-2xl bg-white/[0.04] border border-white/8 text-zinc-500 hover:text-white hover:border-white/20 transition-all hover:rotate-180 duration-300"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>

                            {/* Feature Pills + Social Proof */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="flex flex-wrap items-center gap-3 mt-6"
                            >
                                {[
                                    { icon: "💬", text: "Chat-First" },
                                    { icon: "🔀", text: "Model-Agnostic" },
                                    { icon: "🎬", text: "Node Canvas" },
                                    { icon: "⚡", text: "Transparent" },
                                ].map((pill) => (
                                    <span key={pill.text} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400">
                                        <span>{pill.icon}</span> {pill.text}
                                    </span>
                                ))}
                            </motion.div>
                        </div>

                        {/* RIGHT: 3D Robot Scene */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="flex-1 w-full h-[400px] lg:h-[520px] relative cursor-grab active:cursor-grabbing hidden lg:block"
                        >
                            <div className="relative w-full h-full z-10">
                                <SplineScene
                                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                                    className="w-full h-full"
                                />
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_25%,#0F051D_65%)] pointer-events-none" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full pointer-events-none -z-10" />
                        </motion.div>
                    </div>
                </div>

                {/* Decorational Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D1FE17]/5 blur-[150px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#9F5AFE]/5 blur-[150px] -z-10" />

                {/* Particles */}
                <Particles className="absolute inset-0 z-0 opacity-20" quantity={30} ease={80} color="#a78bfa" refresh />
            </section>

            {/* Features Section - How It Works */}
            <section className="relative py-16 z-10 border-t border-white/5 overflow-hidden">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-12">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="inline-block px-3 py-1 rounded-full bg-[#D1FE17]/10 border border-[#D1FE17]/20 text-[#D1FE17] text-[10px] font-bold tracking-wider uppercase mb-4"
                        >4-Step Workflow</motion.span>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                            How <span className="text-[#D1FE17]">Creavidy</span> Works
                        </h2>
                        <p className="text-zinc-500 text-base max-w-xl mx-auto">From idea to finished content in minutes, not hours</p>
                    </div>

                    <div className="relative max-w-5xl mx-auto">
                        {/* Connecting line */}
                        <div className="hidden lg:block absolute top-20 left-[12%] right-[12%] h-px bg-gradient-to-r from-[#a78bfa]/40 via-[#D1FE17]/40 to-[#FF2D78]/40" />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { step: "01", icon: <Wand2 className="w-6 h-6" />, title: "Describe", desc: "Type your idea in natural language. Choose style, voice, and duration.", color: "#a78bfa", glow: "shadow-[#a78bfa]/20" },
                                { step: "02", icon: <Sparkles className="w-6 h-6" />, title: "AI Plans It", desc: "AI generates a complete plan with scenes, script, and visual direction.", color: "#D1FE17", glow: "shadow-[#D1FE17]/20" },
                                { step: "03", icon: <Layers className="w-6 h-6" />, title: "Customize", desc: "Fine-tune on the node canvas. Swap models, adjust timing, add effects.", color: "#0ea5e9", glow: "shadow-[#0ea5e9]/20" },
                                { step: "04", icon: <Film className="w-6 h-6" />, title: "Export", desc: "Download in HD, 4K, or share directly to YouTube, TikTok, and more.", color: "#FF2D78", glow: "shadow-[#FF2D78]/20" },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.12 }}
                                    className="relative group"
                                >
                                    <div className={`p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all h-full shadow-lg ${item.glow} hover:shadow-xl`}>
                                        {/* Step number badge */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${item.color}20` }}>
                                                <div style={{ color: item.color }}>{item.icon}</div>
                                            </div>
                                            <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: item.color }}>Step {item.step}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                        <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-[#a78bfa]/5 blur-[100px] rounded-full pointer-events-none" />
            </section>

            {/* Key Differentiator Section */}
            <section className="relative py-16 z-10 border-t border-white/5">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: "🔀",
                                title: "Model-Agnostic",
                                desc: "Swap between Flux, Midjourney, DALL-E, Kling, Runway anytime. Never locked in.",
                                accent: "#a78bfa"
                            },
                            {
                                icon: "💬",
                                title: "Chat-First",
                                desc: "No complex UI. Just tell AI what you want. It builds the video pipeline for you.",
                                accent: "#D1FE17"
                            },
                            {
                                icon: "💰",
                                title: "Transparent Pricing",
                                desc: "See exact credit costs per generation, per model. No hidden fees, ever.",
                                accent: "#06d6a0"
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all text-center"
                            >
                                <span className="text-4xl mb-4 block">{item.icon}</span>
                                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-16 z-10 border-t border-white/5">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                            Ready to <span className="text-[#D1FE17]">Create</span>?
                        </h2>
                        <p className="text-zinc-500 text-sm mb-6 max-w-sm mx-auto">
                            Join creators who make professional content with AI.
                        </p>
                        <Link href="/auth/sign-up">
                            <button className="h-11 px-8 rounded-xl bg-[#D1FE17] text-black text-sm font-bold hover:bg-[#c8f010] transition-all inline-flex items-center gap-2">
                                Start Creating Free <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <CosmosFooter />
        </div>
    );
}
