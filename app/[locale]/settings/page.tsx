'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, User, CreditCard, Coins, Clock, Loader2, Save, ExternalLink, Check } from 'lucide-react'

interface Profile {
  display_name?: string
  email?: string
  niche?: string
  plan?: string
  credits_balance?: number
}

interface CreditHistory {
  id: string
  amount: number
  description: string
  created_at: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [history, setHistory] = useState<CreditHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'plan' | 'credits'>('profile')

  useEffect(() => {
    Promise.all([
      fetch('/api/credits').then(r => r.json()),
      fetch('/api/credits/history').then(r => r.json()).catch(() => ({ history: [] })),
    ]).then(([creditsData, historyData]) => {
      setProfile({
        credits_balance: creditsData.remaining,
        plan: creditsData.plan || 'free',
        email: creditsData.email,
        display_name: creditsData.display_name,
      })
      setDisplayName(creditsData.display_name || '')
      setHistory(historyData.history || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, niche: profile?.niche, plan: profile?.plan }),
      })
      setProfile(p => p ? { ...p, display_name: displayName } : p)
      toast.success('Profil güncellendi')
    } catch {
      toast.error('Kayıt başarısız')
    }
    setSaving(false)
  }

  const TABS = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'plan', label: 'Plan & Fatura', icon: CreditCard },
    { id: 'credits', label: 'Kredi Geçmişi', icon: Coins },
  ] as const

  const PLANS = [
    { id: 'free', name: 'Free', price: '$0/ay', credits: '100 kredi/ay', color: '#ffffff' },
    { id: 'starter', name: 'Starter', price: '$19/ay', credits: '1.000 kredi/ay', color: '#D1FE17', popular: true },
    { id: 'pro', name: 'Pro', price: '$49/ay', credits: '5.000 kredi/ay', color: '#a78bfa' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F051D] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F051D] text-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Ayarlar</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{profile?.email}</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="flex flex-col gap-1 w-44 flex-shrink-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                  activeTab === id
                    ? 'bg-white/8 text-white font-medium'
                    : 'text-zinc-500 hover:text-white hover:bg-white/4'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="rounded-2xl bg-white/3 border border-white/8 p-6 space-y-5">
                <h2 className="text-sm font-semibold text-white">Profil Bilgileri</h2>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Görünen İsim</label>
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[#D1FE17]/40 transition-all placeholder-zinc-600"
                    placeholder="İsminizi girin"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">E-posta</label>
                  <input
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-3 py-2.5 rounded-xl bg-white/3 border border-white/6 text-zinc-500 text-sm cursor-not-allowed"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D1FE17] text-black text-sm font-semibold hover:bg-[#D1FE17]/90 transition-all disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Kaydet
                </button>
              </div>
            )}

            {/* Plan Tab */}
            {activeTab === 'plan' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/3 border border-white/8 p-6">
                  <h2 className="text-sm font-semibold text-white mb-4">Mevcut Plan</h2>
                  <div className="flex flex-col gap-3">
                    {PLANS.map(plan => (
                      <div
                        key={plan.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          profile?.plan === plan.id
                            ? 'border-[#D1FE17]/30 bg-[#D1FE17]/5'
                            : 'border-white/6 bg-white/2'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {profile?.plan === plan.id ? (
                            <div className="w-5 h-5 rounded-full bg-[#D1FE17] flex items-center justify-center">
                              <Check className="w-3 h-3 text-black" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-zinc-700" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white">{plan.name}</p>
                              {plan.popular && (
                                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#D1FE17] text-black">Popüler</span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500">{plan.credits}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold" style={{ color: plan.color }}>{plan.price}</span>
                          {profile?.plan !== plan.id && (
                            <Link
                              href={`/pricing?upgrade=${plan.id}`}
                              className="text-[11px] px-3 py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:border-[#D1FE17]/30 hover:text-[#D1FE17] transition-all"
                            >
                              Geç
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/3 border border-white/8 p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Stripe Customer Portal</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Fatura geçmişi ve ödeme yöntemi</p>
                  </div>
                  <a
                    href="/api/stripe/portal"
                    className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white transition-all"
                  >
                    Aç <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Credits Tab */}
            {activeTab === 'credits' && (
              <div className="rounded-2xl bg-white/3 border border-white/8 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-white">Kredi Geçmişi</h2>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D1FE17]/8 border border-[#D1FE17]/15">
                    <Coins className="w-3.5 h-3.5 text-[#D1FE17]" />
                    <span className="text-xs font-semibold text-[#D1FE17]">{profile?.credits_balance?.toLocaleString() ?? '—'} kalan</span>
                  </div>
                </div>
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="w-8 h-8 text-zinc-700 mb-2" />
                    <p className="text-sm text-zinc-500">Henüz işlem yok</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {history.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-xs text-white">{item.description}</p>
                          <p className="text-[10px] text-zinc-600 mt-0.5">
                            {new Date(item.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold ${item.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {item.amount > 0 ? '+' : ''}{item.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
