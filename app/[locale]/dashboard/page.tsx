'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Video, Image, FileText, Coins, Clock, Folder, Zap, ChevronRight, MoreHorizontal, Loader2, Settings } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Project {
  id: string
  title: string
  status: 'draft' | 'planning' | 'generating' | 'review' | 'completed'
  initial_prompt?: string
  final_video_url?: string
  thumbnail_url?: string
  total_credits_used: number
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  draft:      'bg-zinc-800 text-zinc-400',
  planning:   'bg-blue-500/15 text-blue-400',
  generating: 'bg-amber-500/15 text-amber-400',
  review:     'bg-purple-500/15 text-purple-400',
  completed:  'bg-green-500/15 text-green-400',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak', planning: 'Planlanıyor', generating: 'Üretiliyor', review: 'İnceleme', completed: 'Tamamlandı',
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [credits, setCredits] = useState<{ remaining: number; total: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/credits').then(r => r.json()),
    ]).then(([projectsData, creditsData]) => {
      setProjects(projectsData.projects || [])
      if (creditsData.remaining !== undefined) setCredits({ remaining: creditsData.remaining, total: creditsData.total })
    }).finally(() => setLoading(false))
  }, [])

  const creditPct = credits ? Math.round((credits.remaining / credits.total) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0F051D] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Projelerini yönet ve yeni içerikler üret</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="p-2 rounded-xl border border-white/10 text-zinc-500 hover:text-white hover:border-white/20 transition-all"
              title="Ayarlar"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <Link
              href="/workspace/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D1FE17] text-black text-sm font-semibold hover:bg-[#D1FE17]/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Yeni Proje
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Kredi */}
          <div className="rounded-2xl bg-white/3 border border-white/8 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Coins className="w-4 h-4 text-[#D1FE17]" />
                Kalan Kredi
              </div>
              <Link href="/pricing" className="text-[11px] text-[#D1FE17] hover:underline">Yükselt</Link>
            </div>
            {credits ? (
              <>
                <p className="text-2xl font-bold text-white">{credits.remaining.toLocaleString()}</p>
                <p className="text-xs text-zinc-500 mt-0.5">/ {credits.total.toLocaleString()} toplam</p>
                <div className="mt-3 h-1.5 rounded-full bg-white/5">
                  <div className="h-1.5 rounded-full bg-[#D1FE17]" style={{ width: `${creditPct}%` }} />
                </div>
              </>
            ) : (
              <div className="h-8 bg-white/5 rounded animate-pulse mt-1" />
            )}
          </div>

          {/* Toplam Proje */}
          <div className="rounded-2xl bg-white/3 border border-white/8 p-5">
            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
              <Folder className="w-4 h-4 text-[#a78bfa]" />
              Toplam Proje
            </div>
            <p className="text-2xl font-bold text-white">{projects.length}</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {projects.filter(p => p.status === 'completed').length} tamamlandı
            </p>
          </div>

          {/* Hızlı Başlat */}
          <div className="rounded-2xl bg-white/3 border border-white/8 p-5">
            <p className="text-sm text-zinc-400 mb-3">Hızlı Başlat</p>
            <div className="flex flex-col gap-2">
              {[
                { icon: Video, label: 'Video Üret', href: '/workspace/new?mode=video', color: '#D1FE17' },
                { icon: Image, label: 'Görsel Üret', href: '/workspace/new?mode=image', color: '#a78bfa' },
                { icon: FileText, label: 'Script Yaz', href: '/workspace/new?mode=script', color: '#FF2D78' },
              ].map(({ icon: Icon, label, href, color }) => (
                <Link key={href} href={href} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors group">
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  {label}
                  <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Projeler</h2>
            {projects.length > 0 && (
              <p className="text-xs text-zinc-500">{projects.length} proje</p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-white/2 border border-white/6 border-dashed">
              <Zap className="w-8 h-8 text-zinc-700 mb-3" />
              <p className="text-sm text-zinc-500">Henüz proje yok</p>
              <Link href="/workspace/new" className="mt-3 text-xs text-[#D1FE17] hover:underline">İlk projeyi oluştur →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <Link
                  key={project.id}
                  href={`/workspace/${project.id}`}
                  className="group rounded-2xl bg-white/3 border border-white/8 overflow-hidden hover:border-white/15 transition-all hover:bg-white/5"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-white/5 relative overflow-hidden">
                    {project.thumbnail_url ? (
                      <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-zinc-700" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[project.status] || STATUS_STYLES.draft}`}>
                        {STATUS_LABELS[project.status] || project.status}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-sm font-medium text-white truncate group-hover:text-[#D1FE17] transition-colors">
                      {project.title || 'İsimsiz Proje'}
                    </p>
                    {project.initial_prompt && (
                      <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{project.initial_prompt}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-zinc-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                      </span>
                      {project.total_credits_used > 0 && (
                        <span className="flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          {project.total_credits_used} kredi
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
