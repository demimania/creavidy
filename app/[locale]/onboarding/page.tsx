'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronRight, Check, Loader2, Video, Share2, BookOpen, TrendingUp, Gamepad2, Zap } from 'lucide-react'

const NICHES = [
  { id: 'youtube', label: 'YouTube', icon: Video, color: '#FF0000' },
  { id: 'social', label: 'Sosyal Medya', icon: Share2, color: '#E1306C' },
  { id: 'education', label: 'Eğitim', icon: BookOpen, color: '#4F46E5' },
  { id: 'marketing', label: 'Pazarlama', icon: TrendingUp, color: '#D1FE17' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: '#a78bfa' },
]

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    credits: '100',
    features: ['100 kredi/ay', '720p çıktı', 'Temel modeller'],
    color: '#ffffff',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$19',
    credits: '1,000',
    features: ['1.000 kredi/ay', '1080p çıktı', 'Tüm modeller', 'Öncelikli destek'],
    color: '#D1FE17',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    credits: '5,000',
    features: ['5.000 kredi/ay', '4K çıktı', 'Tüm modeller', 'API erişimi', '7/24 destek'],
    color: '#a78bfa',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [displayName, setDisplayName] = useState('')
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('free')
  const [loading, setLoading] = useState(false)

  const handleNext = () => {
    if (step === 1 && !displayName.trim()) {
      toast.error('Lütfen bir isim girin')
      return
    }
    if (step === 2 && !selectedNiche) {
      toast.error('Lütfen bir niş seçin')
      return
    }
    setStep(s => s + 1)
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, niche: selectedNiche, plan: selectedPlan }),
      })
      router.push('/dashboard')
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F051D] flex flex-col items-center justify-center px-4 py-16">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              step > s
                ? 'bg-[#D1FE17] text-black'
                : step === s
                ? 'bg-[#D1FE17]/20 border border-[#D1FE17]/60 text-[#D1FE17]'
                : 'bg-white/5 border border-white/10 text-zinc-500'
            }`}>
              {step > s ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-px transition-all ${step > s ? 'bg-[#D1FE17]/50' : 'bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md">
        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#D1FE17]/10 border border-[#D1FE17]/20 mb-4">
                <Zap className="w-7 h-7 text-[#D1FE17]" />
              </div>
              <h1 className="text-2xl font-bold text-white">Creavidy'ye Hoşgeldin</h1>
              <p className="text-sm text-zinc-500 mt-1.5">AI destekli içerik üretim platformu</p>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Görünen İsim</label>
              <input
                autoFocus
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                placeholder="Nasıl görünmek istersin?"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 outline-none focus:border-[#D1FE17]/40 focus:bg-white/8 transition-all text-sm"
              />
            </div>
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D1FE17] text-black text-sm font-semibold hover:bg-[#D1FE17]/90 transition-all"
            >
              Devam Et <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2 — Niche */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">İçerik Nişin</h1>
              <p className="text-sm text-zinc-500 mt-1.5">Hangi alanda içerik üretiyorsun?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {NICHES.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => setSelectedNiche(id)}
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all ${
                    selectedNiche === id
                      ? 'border-[#D1FE17]/50 bg-[#D1FE17]/8'
                      : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <span className="text-xs font-medium text-white">{label}</span>
                  {selectedNiche === id && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#D1FE17] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-black" />
                    </div>
                  )}
                </button>
              ))}
              <button
                onClick={() => setSelectedNiche('other')}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all ${
                  selectedNiche === 'other'
                    ? 'border-[#D1FE17]/50 bg-[#D1FE17]/8'
                    : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                  <span className="text-lg">✦</span>
                </div>
                <span className="text-xs font-medium text-white">Diğer</span>
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm hover:border-white/20 hover:text-white transition-all"
              >
                Geri
              </button>
              <button
                onClick={handleNext}
                className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D1FE17] text-black text-sm font-semibold hover:bg-[#D1FE17]/90 transition-all"
              >
                Devam Et <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Plan */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Planını Seç</h1>
              <p className="text-sm text-zinc-500 mt-1.5">İstediğin zaman değiştirebilirsin</p>
            </div>
            <div className="flex flex-col gap-3">
              {PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative text-left p-4 rounded-2xl border transition-all ${
                    selectedPlan === plan.id
                      ? 'border-[#D1FE17]/40 bg-[#D1FE17]/5'
                      : 'border-white/8 bg-white/3 hover:border-white/15'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D1FE17] text-black">
                      Popüler
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedPlan === plan.id ? 'border-[#D1FE17] bg-[#D1FE17]' : 'border-zinc-600'
                      }`}>
                        {selectedPlan === plan.id && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                      <span className="font-semibold text-white text-sm">{plan.name}</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: plan.color }}>{plan.price}<span className="text-xs text-zinc-500">/ay</span></span>
                  </div>
                  <ul className="flex flex-wrap gap-x-3 gap-y-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-1 text-[11px] text-zinc-500">
                        <Check className="w-3 h-3 text-zinc-600" />{f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 text-sm hover:border-white/20 hover:text-white transition-all"
              >
                Geri
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D1FE17] text-black text-sm font-semibold hover:bg-[#D1FE17]/90 transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Başla <Zap className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
