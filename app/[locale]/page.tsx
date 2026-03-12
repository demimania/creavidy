"use client";

import { useState, useRef } from "react";
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
    CreditCard, User, Palette
} from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { CosmosFooter } from "@/components/ui/cosmos-footer";
import { useProjectStore } from "@/lib/stores/project-store";

// Style options with visual data
const STYLES = [
    { id: "realistic", label: "Realistic Film", emoji: "🎬", color: "#e2e8f0" },
    { id: "cartoon3d", label: "Cartoon 3D", emoji: "🧊", color: "#a78bfa" },
    { id: "photograph", label: "Photograph", emoji: "📷", color: "#60a5fa" },
    { id: "anime", label: "Anime", emoji: "🌸", color: "#f472b6" },
    { id: "watercolor", label: "Watercolor", emoji: "🎨", color: "#34d399" },
    { id: "pixelart", label: "Pixel Art", emoji: "👾", color: "#fbbf24" },
];

// Voice options — names must match CapCutNodes narratorOptions
// id = OpenAI TTS voiceId used for actual generation
const VOICES = [
    { id: "alloy",   name: "Jolly Yapper", type: "voice" as const, gender: "Neutral", accent: "American" },
    { id: "echo",    name: "Happy Dino",   type: "voice" as const, gender: "Male",    accent: "American" },
    { id: "fable",   name: "Ms. Labebe",   type: "voice" as const, gender: "Male",    accent: "British"  },
    { id: "nova",    name: "Lady Holiday", type: "voice" as const, gender: "Female",  accent: "American" },
];

// Inspiration prompts
const INSPIRATIONS = [
    { title: "🏙️ Rooftop sunset timelapse", prompt: "A cinematic timelapse of a city skyline at sunset, warm golden light fading to deep blue, with ambient electronic music and smooth camera movement" },
    { title: "🚀 SaaS product demo", prompt: "A sleek, modern product demo video for a design tool, showing UI interactions with smooth transitions and a professional narrator" },
    { title: "📱 Social media ad", prompt: "A 15-second vertical ad for a fitness app, fast-paced cuts between workout scenes, bold text overlays, and energetic background music" },
    { title: "🎨 Brand story", prompt: "A 60-second brand story for a sustainable fashion startup, showing the journey from raw materials to finished product with warm, earthy tones" },
];

export default function LandingPage() {
    const router = useRouter();
    const { prompt, setPrompt, style, setStyle, voice, setVoice, duration, setDuration, aspectRatio, setAspectRatio, setCurrentStep } = useProjectStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Dropdown states
    const [showStyleDropdown, setShowStyleDropdown] = useState(false);
    const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState<"inspiration" | "templates" | "projects">("inspiration");

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
            <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden">
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
                                className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-3"
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
                                <div className="relative mb-3">
                                    <textarea
                                        ref={textareaRef}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe your video idea..."
                                        maxLength={2000}
                                        rows={3}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#a78bfa]/50 resize-none text-sm leading-relaxed"
                                    />
                                    <span className="absolute bottom-2 right-3 text-[9px] text-zinc-600">
                                        {prompt.length}/2000
                                    </span>
                                </div>

                                {/* Control Row */}
                                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                                    {/* Upload Reference */}
                                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-zinc-400 hover:text-white hover:border-white/20 transition-all">
                                        <Upload className="w-3 h-3" />
                                        <span className="hidden sm:inline">Upload</span>
                                    </button>

                                    {/* Style Selector */}
                                    <div className="relative">
                                        <button
                                            onClick={() => { setShowStyleDropdown(!showStyleDropdown); setShowVoiceDropdown(false); setShowSettingsDropdown(false); }}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                                        >
                                            <Palette className="w-3 h-3" />
                                            <span>{selectedStyle.emoji} {selectedStyle.label}</span>
                                            <ChevronDown className="w-2.5 h-2.5" />
                                        </button>
                                        <AnimatePresence>
                                            {showStyleDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 8 }}
                                                    className="absolute top-full mt-2 left-0 bg-[#1a1025] border border-white/10 rounded-2xl p-3 z-50 w-64 shadow-2xl grid grid-cols-2 gap-2"
                                                >
                                                    {STYLES.map(s => (
                                                        <button
                                                            key={s.id}
                                                            onClick={() => { setStyle(s.id); setShowStyleDropdown(false); }}
                                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${style === s.id
                                                                ? "bg-[#a78bfa]/20 border border-[#a78bfa]/40 text-white"
                                                                : "bg-white/5 border border-transparent text-zinc-400 hover:text-white hover:bg-white/10"
                                                                }`}
                                                        >
                                                            <span className="text-base">{s.emoji}</span>
                                                            {s.label}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Voice Selector */}
                                    <div className="relative">
                                        <button
                                            onClick={() => { setShowVoiceDropdown(!showVoiceDropdown); setShowStyleDropdown(false); setShowSettingsDropdown(false); }}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                                        >
                                            <Mic className="w-3 h-3" />
                                            <span>{voice ? voice.name : "Voice"}</span>
                                            <ChevronDown className="w-2.5 h-2.5" />
                                        </button>
                                        <AnimatePresence>
                                            {showVoiceDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 8 }}
                                                    className="absolute top-full mt-2 left-0 bg-[#1a1025] border border-white/10 rounded-2xl p-3 z-50 w-56 shadow-2xl space-y-1"
                                                >
                                                    {VOICES.map(v => (
                                                        <button
                                                            key={v.id}
                                                            onClick={() => { setVoice(v); setShowVoiceDropdown(false); }}
                                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${voice?.id === v.id
                                                                ? "bg-[#a78bfa]/20 border border-[#a78bfa]/40 text-white"
                                                                : "bg-white/5 border border-transparent text-zinc-400 hover:text-white hover:bg-white/10"
                                                                }`}
                                                        >
                                                            <span>{v.name}</span>
                                                            <span className="text-[10px] text-zinc-600">{v.gender} · {v.accent}</span>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Settings */}
                                    <div className="relative">
                                        <button
                                            onClick={() => { setShowSettingsDropdown(!showSettingsDropdown); setShowStyleDropdown(false); setShowVoiceDropdown(false); }}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                                        >
                                            <Settings className="w-3 h-3" />
                                            <span>{duration}s · {aspectRatio}</span>
                                            <ChevronDown className="w-2.5 h-2.5" />
                                        </button>
                                        <AnimatePresence>
                                            {showSettingsDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 8 }}
                                                    className="absolute top-full mt-2 right-0 bg-[#1a1025] border border-white/10 rounded-2xl p-4 z-50 w-64 shadow-2xl space-y-4"
                                                >
                                                    {/* Duration */}
                                                    <div>
                                                        <label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 block">Duration</label>
                                                        <div className="flex gap-1.5">
                                                            {[5, 15, 30, 60].map(d => (
                                                                <button
                                                                    key={d}
                                                                    onClick={() => setDuration(d)}
                                                                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${duration === d
                                                                        ? "bg-[#D1FE17] text-black"
                                                                        : "bg-white/5 text-zinc-400 hover:text-white"
                                                                        }`}
                                                                >
                                                                    {d}s
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* Aspect Ratio */}
                                                    <div>
                                                        <label className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 block">Aspect Ratio</label>
                                                        <div className="flex gap-1.5">
                                                            {["16:9", "9:16", "1:1", "4:5"].map(r => (
                                                                <button
                                                                    key={r}
                                                                    onClick={() => setAspectRatio(r)}
                                                                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${aspectRatio === r
                                                                        ? "bg-[#D1FE17] text-black"
                                                                        : "bg-white/5 text-zinc-400 hover:text-white"
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

                                {/* Create Button */}
                                <button
                                    onClick={handleCreate}
                                    className="w-full h-12 rounded-2xl bg-[#D1FE17] text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#c8f010] transition-all group shadow-lg shadow-[#D1FE17]/20 cursor-pointer"
                                >
                                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                    Create Now
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>

                            {/* Inspiration Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.35 }}
                                className="mt-6"
                            >
                                {/* Tab Bar */}
                                <div className="flex items-center gap-1 bg-white/5 backdrop-blur rounded-full p-1 w-fit mb-4">
                                    {([
                                        { key: "inspiration", label: "✨ Inspiration" },
                                        { key: "templates", label: "📋 Templates" },
                                        { key: "projects", label: "📁 My Projects" },
                                    ] as const).map(tab => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${activeTab === tab.key
                                                ? "bg-white/10 text-white"
                                                : "text-zinc-500 hover:text-zinc-300"
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Content */}
                                <AnimatePresence mode="wait">
                                    {activeTab === "inspiration" && (
                                        <motion.div
                                            key="inspiration"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                                        >
                                            {INSPIRATIONS.map((item, i) => (
                                                <motion.button
                                                    key={i}
                                                    onClick={() => handleInspirationClick(item.prompt)}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="text-left p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#a78bfa]/30 hover:bg-white/[0.06] transition-all group"
                                                >
                                                    <p className="text-xs font-semibold text-white mb-0.5">{item.title}</p>
                                                    <p className="text-[11px] text-zinc-500 line-clamp-2 group-hover:text-zinc-400 transition-colors">{item.prompt}</p>
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    )}

                                    {activeTab === "templates" && (
                                        <motion.div
                                            key="templates"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-center py-8"
                                        >
                                            <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                            <p className="text-zinc-500 text-xs">No templates yet. Create your first workflow!</p>
                                        </motion.div>
                                    )}

                                    {activeTab === "projects" && (
                                        <motion.div
                                            key="projects"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-center py-8"
                                        >
                                            <Film className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                            <p className="text-zinc-500 text-xs">Your projects will appear here.</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                            className="flex-1 w-full h-[500px] lg:h-[700px] relative cursor-grab active:cursor-grabbing hidden lg:block"
                        >
                            <div className="relative w-full h-full z-10">
                                <SplineScene
                                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                                    className="w-full h-full"
                                />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0F051D_70%)] pointer-events-none" />
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
            <section className="relative py-24 z-10 border-t border-white/5 overflow-hidden">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
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
            <section className="relative py-24 z-10 border-t border-white/5">
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
            <section className="relative py-24 z-10 border-t border-white/5">
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
