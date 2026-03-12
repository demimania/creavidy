"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles, Star, Zap, Crown, Coins, Loader2 } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { CosmosFooter } from "@/components/ui/cosmos-footer";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const CREDIT_COSTS = [
  { action: "Script generation", credits: 5, icon: "📝" },
  { action: "Image generation (Flux)", credits: 10, icon: "🖼" },
  { action: "Image generation (DALL·E)", credits: 20, icon: "🎨" },
  { action: "Video generation (Kling)", credits: 30, icon: "🎬" },
  { action: "Video generation (Sora)", credits: 50, icon: "🎥" },
  { action: "Text-to-Speech (per min)", credits: 5, icon: "🔊" },
  { action: "Export", credits: 0, icon: "📤" },
];

const plans = [
    {
        name: "Free",
        tagline: "Try it out — create your first AI content.",
        monthlyPrice: 0,
        annualPrice: 0,
        credits: 50,
        period: "forever",
        features: [
            "50 credits / month",
            "All AI models",
            "720p export",
            "Watermark on exports",
            "Community support",
        ],
        missing: [
            "Priority rendering",
            "Voice cloning",
            "API access",
            "Remove watermark",
        ],
        cta: "Get Started Free",
        tier: "free" as const,
    },
    {
        name: "Starter",
        tagline: "For individual creators getting started.",
        monthlyPrice: 19,
        annualPrice: 15,
        credits: 500,
        period: "/month",
        annualSaving: 48,
        features: [
            "500 credits / month",
            "All AI models",
            "1080p export",
            "Basic voice cloning",
            "No watermark",
            "Email support",
        ],
        missing: [
            "Priority rendering",
            "API access",
        ],
        cta: "Start Creating",
        tier: "starter" as const,
        priceIds: {
            monthly: "price_1SzYDlRv1Bm4qTxATgUrevwT",
            annual:  "price_1SzYDlRv1Bm4qTxAP5ho2t0T",
        }
    },
    {
        name: "Pro",
        tagline: "For professional creators and freelancers.",
        monthlyPrice: 49,
        annualPrice: 39,
        credits: 2000,
        period: "/month",
        annualSaving: 120,
        popular: true,
        features: [
            "2,000 credits / month",
            "All AI models",
            "4K export",
            "Professional voice cloning",
            "Priority rendering",
            "No watermark",
            "Priority support",
        ],
        missing: [
            "API access",
        ],
        cta: "Go Pro",
        tier: "pro" as const,
        priceIds: {
            monthly: "price_1SzYDmRv1Bm4qTxATzJWZAu2",
            annual:  "price_1SzYDmRv1Bm4qTxAp6wSCMl0",
        }
    },
    {
        name: "Team",
        tagline: "For teams and agencies at scale.",
        monthlyPrice: 99,
        annualPrice: 79,
        credits: 5000,
        period: "/month",
        annualSaving: 240,
        bestValue: true,
        features: [
            "5,000 credits / month",
            "All AI models",
            "4K export",
            "Unlimited voice cloning",
            "Instant rendering",
            "API access",
            "White-label options",
            "Dedicated support",
        ],
        missing: [],
        cta: "Start Team Plan",
        tier: "team" as const,
        priceIds: {
            monthly: "price_1SzYDmRv1Bm4qTxATzJWZAu2", // uses agency plan until Team is created
            annual:  "price_1SzYDmRv1Bm4qTxAp6wSCMl0",
        }
    },
];

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true);
    const [loading, setLoading] = useState<string | null>(null);
    const [showCredits, setShowCredits] = useState(false);
    const router = useRouter();

    const handleSubscribe = async (tier: string, priceId?: string) => {
        if (!priceId) {
            router.push('/auth/sign-up');
            return;
        }
        setLoading(tier);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            if (data.url) window.location.href = data.url;
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to start checkout");
            setLoading(null);
        }
    };

    const getStyles = (tier: string, popular?: boolean, bestValue?: boolean) => {
        if (bestValue) return {
            border: "border-[#00f1ea]", glow: "shadow-[0_0_40px_-10px_rgba(0,241,234,0.3)]",
            bg: "bg-gradient-to-b from-[#00f1ea]/5 to-black/40",
            button: "bg-[#00f1ea] text-black hover:bg-[#00f1ea]/90", check: "text-[#00f1ea]",
        };
        if (popular) return {
            border: "border-[#D1FE17]", glow: "shadow-[0_0_40px_-10px_rgba(209,254,23,0.3)]",
            bg: "bg-gradient-to-b from-[#D1FE17]/5 to-black/40",
            button: "bg-[#D1FE17] text-black hover:bg-[#D1FE17]/90", check: "text-[#D1FE17]",
        };
        return {
            border: "border-white/10 hover:border-white/20", glow: "",
            bg: "bg-black/40", button: "bg-white/10 text-white hover:bg-white/20", check: "text-zinc-400",
        };
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#0F051D] text-white font-sans overflow-x-hidden">
            <Navbar />

            <main className="flex-1 relative z-10 pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D1FE17]/10 border border-[#D1FE17]/20 text-[#D1FE17] text-[10px] font-bold tracking-wider uppercase mb-4"
                        >
                            <Coins className="w-3 h-3" />Credit-Based Pricing
                        </motion.span>

                        <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-zinc-400 text-sm max-w-lg mx-auto mb-8">
                            Pay only for what you create. Every plan includes all AI models.
                        </p>

                        {/* Monthly / Annual Toggle */}
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-white" : "text-zinc-500"}`}>Monthly</span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isAnnual ? "bg-[#D1FE17]" : "bg-white/20"}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${isAnnual ? "left-7 bg-black" : "left-1 bg-white"}`} />
                            </button>
                            <span className={`text-sm font-medium transition-colors ${isAnnual ? "text-white" : "text-zinc-500"}`}>Annual</span>
                            {isAnnual && <span className="px-2 py-0.5 bg-[#D1FE17] text-black text-[10px] font-bold rounded-full">Save 20%</span>}
                        </div>

                        {/* Credit Cost Toggle */}
                        <button
                            onClick={() => setShowCredits(!showCredits)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-300 hover:bg-white/10 transition-colors"
                        >
                            <Coins className="w-3.5 h-3.5" />
                            {showCredits ? "Hide" : "Show"} credit costs
                        </button>
                    </div>

                    {/* Credit Cost Table */}
                    {showCredits && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="max-w-md mx-auto mb-10 rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden"
                        >
                            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                                <Coins className="w-4 h-4 text-[#D1FE17]" />
                                <span className="text-xs font-semibold">Credit Costs per Action</span>
                            </div>
                            {CREDIT_COSTS.map((item, i) => (
                                <div key={i} className={`flex items-center justify-between px-4 py-2.5 text-xs ${i !== CREDIT_COSTS.length - 1 ? 'border-b border-white/5' : ''}`}>
                                    <span className="text-zinc-400">{item.icon} {item.action}</span>
                                    <span className={`font-semibold ${item.credits === 0 ? 'text-[#D1FE17]' : 'text-white'}`}>
                                        {item.credits === 0 ? 'Free' : `${item.credits} credits`}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {plans.map((plan: any, index) => {
                            const styles = getStyles(plan.tier, plan.popular, plan.bestValue);
                            const price = isAnnual ? (plan.annualPrice || plan.monthlyPrice) : plan.monthlyPrice;
                            const displayPrice = price === 0 ? "Free" : `$${price}`;
                            const priceId = plan.priceIds ? (isAnnual ? plan.priceIds.annual : plan.priceIds.monthly) : undefined;
                            const isLoading = loading === plan.tier;

                            return (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.08, duration: 0.5 }}
                                    className={`relative rounded-2xl border backdrop-blur-xl flex flex-col ${styles.border} ${styles.glow} ${styles.bg} transition-all duration-300`}
                                >
                                    {/* Badge */}
                                    {(plan.popular || plan.bestValue) && (
                                        <div className="px-5 pt-4">
                                            {plan.popular && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#D1FE17] text-black text-[9px] font-bold rounded-full uppercase tracking-wider">
                                                    <Star className="w-3 h-3" />Most Popular
                                                </span>
                                            )}
                                            {plan.bestValue && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#00f1ea] text-black text-[9px] font-bold rounded-full uppercase tracking-wider">
                                                    <Zap className="w-3 h-3" />Best Value
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Plan Info */}
                                    <div className="px-5 pt-4 pb-3">
                                        <h3 className="text-lg font-bold mb-0.5">{plan.name}</h3>
                                        <p className="text-[11px] text-zinc-400 mb-4">{plan.tagline}</p>

                                        <div className="flex items-baseline gap-1.5 mb-1">
                                            <span className="text-3xl font-black">{displayPrice}</span>
                                            {price > 0 && <span className="text-xs text-zinc-500">{plan.period}</span>}
                                        </div>

                                        {isAnnual && plan.annualSaving > 0 && (
                                            <p className="text-[10px] text-[#D1FE17] font-medium">Save ${plan.annualSaving}/year</p>
                                        )}

                                        {/* Credits highlight */}
                                        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/8">
                                            <Coins className="w-3.5 h-3.5 text-[#D1FE17]" />
                                            <span className="text-xs font-semibold text-white">{plan.credits.toLocaleString()} credits/mo</span>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div className="px-5 mb-4">
                                        <button
                                            onClick={() => handleSubscribe(plan.tier, priceId)}
                                            disabled={!!loading}
                                            className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${styles.button} ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                                        >
                                            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                            {plan.cta}
                                        </button>
                                    </div>

                                    <div className="mx-5 border-t border-white/5 mb-4" />

                                    {/* Features */}
                                    <div className="px-5 flex-1 space-y-2.5 pb-5">
                                        {plan.features.map((f: string) => (
                                            <div key={f} className="flex items-start gap-2 text-[11px]">
                                                <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${styles.check}`} />
                                                <span className="text-zinc-200">{f}</span>
                                            </div>
                                        ))}
                                        {plan.missing.map((f: string) => (
                                            <div key={f} className="flex items-start gap-2 text-[11px] opacity-40">
                                                <X className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-zinc-600" />
                                                <span className="text-zinc-500">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Bottom */}
                    <div className="text-center mt-14">
                        <p className="text-zinc-500 text-xs mb-3">Need more credits or a custom plan?</p>
                        <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-white hover:bg-white/10 transition-colors">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </main>

            <CosmosFooter />
        </div>
    );
}
