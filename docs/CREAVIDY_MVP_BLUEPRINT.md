# CREAVIDY MVP BLUEPRINT v2.1

**Sürüm:** 2.1
**Güncelleme Tarihi:** 2026-03-08
**Durum:** MVP Geliştirme - Aktif
**Öncelik:** UX-First — Önce çalışsın, sonra para alsın
**Execution Engine:** Direkt fal.ai (n8n kullanılmıyor)

---

## 1. PROJE KİMLİĞİ

### Proje Adı
**CREAVIDY** — AI-Powered Content Creation Studio

### Vizyonu
Yapay zeka ile video, görsel, script ve avatar üretimini tek bir platformda birleştiren, node tabanlı iş akışı editörü sunan yaratıcı stüdyo.

### Temel Değer Önerisi (UVP)
> "Hayal et, yaz, üret. Tek platformda tüm AI modelleri senin için çalışsın."

**İngilizce:** "Imagine, describe, create. All AI models working for you in one studio."

### Ne Değiliz
- Bir link-in-bio platformu değiliz
- Bir YouTube yönetim aracı değiliz
- Bir marketplace değiliz

### Ne Yapıyoruz
1. **AI Video Üretimi** — Metin prompt'undan profesyonel video (Kling, Veo, Luma, Hunyuan vb.)
2. **AI Görsel Üretimi** — Prompt'tan yüksek kalite görsel (Flux, Recraft, SD, Midjourney vb.)
3. **AI Script Yazımı** — GPT-4o ve Gemini ile senaryo / script üretimi
4. **AI Ses Üretimi** — Metinden konuşma (ElevenLabs, OpenAI TTS, fal TTS)
5. **AI Avatar Üretimi** — Kişiselleştirilmiş dijital avatar (Roadmap)
6. **Node Tabanlı Workflow** — Görsel editör ile karmaşık üretim pipeline'ları kurma
7. **AI Direktör Chat** — Chat arayüzünde yapay zeka video direktörü ile sahne planlama

### Proje Hedefleri
1. Tek bir prompt'tan uçtan uca video üretim akışı sağlamak
2. 10+ AI modelini tek bir arayüzden erişilebilir kılmak
3. Node editörü ile profesyonel kullanıcılara gelişmiş kontrol sunmak
4. Kredi bazlı, sürdürülebilir SaaS gelir modeli oluşturmak
5. 3 ay içinde public beta, 6 ay içinde 5.000+ kullanıcıya ulaşmak

---

## 2. HEDEF KİTLE VE PERSONALAR

### Persona 1: "Hızlı Üretici Deniz" — Solo Content Creator

**Demografik Bilgiler:**
- Yaş: 26
- Meslek: Freelance içerik üretici / Sosyal medya yöneticisi
- Platformlar: YouTube, Instagram Reels, TikTok
- Teknik Seviye: Orta (Canva, CapCut kullanıyor)
- Coğrafya: Türkiye / Global
- Bütçe: Aylık $20-50 arası araçlara harcıyor

**Ağrı Noktaları:**
1. Video üretimi çok uzun sürüyor (çekim, kurgu, efekt)
2. Her platform için farklı format gerekiyor (16:9, 9:16, 1:1)
3. Profesyonel seslendirme yaptıramıyor
4. Adobe suite çok pahalı ve karmaşık
5. AI araçları dağınık — görsel için bir araç, video için başka, ses için başka

**Creavidy Kullanım Senaryosu:**
1. Landing page'e gelir, "30 saniyelik ürün tanıtım videosu" yazar
2. AI Direktör sahneleri planlar, Deniz onaylar
3. Tek tıkla: script → seslendirme → görseller → video üretilir
4. 3 farklı formatta (Reels, YouTube, TikTok) dışa aktarır
5. Toplam süre: 10 dakika (eskiden 2 gün)

**Değer Metriği:** Haftalık 5+ içerik üretme kapasitesi (eskiden 1-2)

---

### Persona 2: "Profesyonel Prodüktör Elif" — Ajans / Studio

**Demografik Bilgiler:**
- Yaş: 32
- Meslek: Video prodüksiyon şirketinde kreatif direktör
- Ekip: 3-5 kişilik prodüksiyon ekibi
- Teknik Seviye: İleri (Premiere Pro, After Effects)
- Bütçe: Aylık $100-500 arası araçlara

**Ağrı Noktaları:**
1. Müşteri için hızlı konsept video / moodboard gerekiyor
2. Seslendirme stüdyosu ayarlamak zaman alıyor
3. Her proje için farklı AI araçları deneyip karşılaştırmak gerekiyor
4. Ekip içi workflow paylaşımı zor
5. Maliyet takibi yapılamıyor (hangi model ne kadar tuttu?)

**Creavidy Kullanım Senaryosu:**
1. Node editöründe custom workflow kurar (Script → TTS → Image → Video → Caption)
2. Aynı prompt'u farklı modellerle karşılaştırır (Kling vs Veo vs Luma)
3. Müşteriye 30 dakikada konsept video sunar
4. Kredi kullanımını takip eder, projeye göre maliyet hesaplar
5. Beğenilen versiyon üzerinde iterasyon yapar

**Değer Metriği:** Konsept video süresini 2 günden 30 dakikaya düşürme

---

### Persona 3: "Meraklı Öğrenci Can" — Hobi / Keşfeden Kullanıcı

**Demografik Bilgiler:**
- Yaş: 20
- Meslek: Üniversite öğrencisi
- Teknik Seviye: Başlangıç
- Bütçe: Ücretsiz veya minimum ($0-19/ay)
- İlgi: AI teknolojileri, yaratıcı projeler

**Ağrı Noktaları:**
1. AI modellerini denemek istiyor ama her birinin ayrı kaydı/API'si var
2. Teknik bilgisi yeterli değil (API key, Python script vb.)
3. Bütçesi sınırlı — her aracı ayrı ayrı ödeyemez
4. Hangisinin daha iyi sonuç verdiğini bilemez

**Creavidy Kullanım Senaryosu:**
1. Ücretsiz plan ile kaydolur (50 kredi)
2. Prompt yazar, AI Direktör yönlendirir
3. Flux Schnell ile ücretsiz görseller üretir
4. Mochi ile düşük maliyetli video dener
5. Beğenirse Starter plana geçer

**Değer Metriği:** Sıfır teknik bilgiyle AI içerik üretebilme

---

## 3. ÜRÜN MİMARİSİ

### 3.1 Kullanıcı Akışları (User Flows)

#### Flow A: Hızlı Üretim (Quick Create)
```
Landing Page → Prompt Yaz → Stil/Ses/Süre Seç → "Create" Tıkla
    ↓
Create Sayfası → Mod Seç (Video/Image/Script/Avatar)
    ↓
Workspace → AI Direktör Chat (sol panel) + Sahne Canvas (sağ panel)
    ↓
Sahne Onay → Otomatik Node Workflow Oluşturma
    ↓
Üretim Başlat → Sonuçları İzle → Dışa Aktar
```

#### Flow B: Profesyonel Workflow (Node Editor)
```
Workspace → Boş Canvas Aç
    ↓
Node Palette'ten Sürükle-Bırak → Script Node → Voice Node → ImageGen Node → VideoGen Node → Export Node
    ↓
Her Node'un Ayarlarını Yap (model, resolution, stil vb.)
    ↓
Bağlantıları Çiz (edge'ler)
    ↓
"Execute Workflow" → Sıralı/Paralel Üretim
    ↓
Sonuçları Node İçinde Önizle → Beğenmezsen Tekrar Üret → Dışa Aktar
```

#### Flow C: VideoBrief → FilmStrip (CapCut Tarzı)
```
Workspace → VideoBrief Node Ekle
    ↓
Stil, Anlatıcı, Müzik, Süre Ayarla → Prompt Yaz
    ↓
"Generate Script" → AI sahne sahne script yazar
    ↓
Otomatik FilmStrip Node Oluşur (bağlantılı)
    ↓
Her Sahne İçin: Görsel Üret → Ses Üret → Video Üret
    ↓
Tam Video Önizleme → Dışa Aktar
```

### 3.2 Sayfa Yapısı

| Sayfa | Yol | Amaç | Durum |
|-------|-----|-------|-------|
| Landing Page | `/` | İlk izlenim, prompt girişi, CTA | ✅ Tamamlandı |
| Create | `/create` | Mod seçimi, stil/ses/ayar | ✅ Tamamlandı |
| Chat Workspace | `/chat` | AI Direktör ile sahne planlama | ⚠️ Kısmen (sahne canvas eksik) |
| Node Workspace | `/workspace/[projectId]` | Node editörü, profesyonel mod | ⚠️ Kısmen (execution engine var ama kredi kontrolü eksik) |
| Pricing | `/pricing` | Plan karşılaştırma, ödeme | ⚠️ Kısmen (Stripe checkout yarım) |
| Sign In | `/auth/sign-in` | Giriş | ✅ Tamamlandı |
| Sign Up | `/auth/sign-up` | Kayıt | ✅ Tamamlandı |
| Onboarding | `/onboarding` | İlk kullanım rehberi | ❌ Eksik |
| Dashboard | `/dashboard` | Proje listesi, kredi durumu | ❌ Eksik |
| Settings | `/settings` | Hesap, plan, tercihler | ❌ Eksik |

---

## 4. İŞ MODELİ VE GELİR YAPISI

### Satış Modeli: Kredi Bazlı SaaS (Freemium)

Kullanıcılar aylık kredi alır, her AI işlemi kredi harcar. Farklı modeller farklı kredi maliyetine sahiptir.

### Pricing Katmanları

| Katman | Fiyat | Aylık Kredi | Dışa Aktarım | Ses Klonlama | Özellikler |
|--------|-------|-------------|---------------|--------------|------------|
| **Free** | $0 | 50 | 720p + Watermark | ❌ | Temel modeller, günde 3 üretim |
| **Starter** | $19/ay | 500 | 1080p | Temel | Tüm modeller, sınırsız üretim |
| **Pro** | $49/ay | 2.000 | 4K | Profesyonel | Öncelikli kuyruk, API erişimi |
| **Team** | $99/ay | 5.000 | 4K | Sınırsız | Ekip yönetimi, paylaşımlı workspace |

**Yıllık:** %20 indirim

### Kredi Maliyetleri (Model Bazlı)

#### Script / LLM Üretimi
| Model | Kredi |
|-------|-------|
| GPT-4o | 5 |
| Gemini 2.0 Flash | 4 |
| Claude 3.5 | 5 |

#### Görsel Üretimi
| Model | Kredi | Tavsiye |
|-------|-------|---------|
| Flux Schnell | 5 | ⭐ Hızlı & ucuz |
| Flux Pro | 12 | Yüksek kalite |
| Flux Kontext | 15 | Bağlamsal düzenleme |
| Recraft v4 | 10 | Vektör & logo |
| SD 3.5 | 8 | Genel amaçlı |
| Imagen (Nano Banana) | 8 | Google kalitesi |
| ImagineArt 1.5 | 10 | Sanatsal |
| DALL-E 3 | 20 | OpenAI |
| Midjourney | 25 | Premium kalite |

#### Video Üretimi
| Model | Kredi | Tavsiye |
|-------|-------|---------|
| Mochi 1 | 15 | ⭐ En ucuz |
| LTX 2.3 | 20 | Hızlı |
| Hunyuan | 20 | Tencent |
| LTX 2-19B | 22 | Kaliteli |
| Kling 2.5 Turbo | 25 | ⭐ En iyi fiyat/performans |
| Minimax Hailuo | 28 | Detaylı |
| Kling 2.0 Master | 30 | Premium |
| Luma Dream Machine | 35 | Yaratıcı |
| Veo 3 | 50 | Google premium |
| Veo 3.1 | 55 | En yüksek kalite |

#### Ses Üretimi (TTS)
| Model | Kredi |
|-------|-------|
| fal TTS | 2 |
| OpenAI TTS | 3 |
| ElevenLabs | 5 |

#### Dışa Aktarım
| İşlem | Kredi |
|-------|-------|
| Tüm formatlar (mp4/webm/mov) | 0 (Ücretsiz) |

### Gelir Projeksiyonu (6 Ay)

| Ay | Kullanıcı | Paid % | MRR | Notlar |
|----|-----------|--------|-----|--------|
| 1 | 200 | 5% | $380 | Beta lansmanı |
| 2 | 500 | 8% | $1.140 | Product Hunt |
| 3 | 1.200 | 10% | $3.420 | Organik büyüme |
| 4 | 2.500 | 12% | $8.550 | İçerik pazarlama |
| 5 | 4.000 | 14% | $15.960 | Referral programı |
| 6 | 6.000 | 15% | $25.650 | Stabilizasyon |

**Varsayımlar:** Paid kullanıcıların %60'ı Starter, %30'u Pro, %10'u Team

### Maliyet Yapısı

| Kalem | Aylık Tahmini | Notlar |
|-------|---------------|--------|
| fal.ai API | ~%30-40 gelirin | Kullanıma göre ölçeklenir |
| OpenAI API | ~$100-500 | Chat + script üretimi |
| ElevenLabs | ~$50-200 | TTS kullanımına göre |
| Supabase | $25-75 | Pro plan |
| Vercel | $20-50 | Pro plan |
| Stripe fees | ~%2.9 + $0.30 | İşlem başına |
| **Hedef Gross Margin** | **%50-60** | |

---

## 5. TEKNİK MİMARİ

### 5.1 Technology Stack

**Frontend:**
- Framework: Next.js 16 (App Router)
- Language: TypeScript
- UI: Tailwind CSS + Radix UI (Shadcn)
- Animasyonlar: Framer Motion
- Node Editörü: ReactFlow
- State: Zustand
- Form: React Hook Form + Zod
- 3D: Spline (landing page)
- i18n: next-intl (en, tr, es, fr, de, pt, ja, zh)

**Backend:**
- Runtime: Next.js API Routes (Edge-ready)
- Database: PostgreSQL (Supabase)
- Auth: Supabase Auth (Email + Google OAuth)
- Storage: Supabase Storage
- Ödeme: Stripe

**AI Servisleri (fal.ai üzerinden):**
- Görsel: Flux, Recraft, SD, Imagen, ImagineArt, DALL-E, Midjourney
- Video: Kling, Veo, LTX, Minimax, Luma, Hunyuan, Mochi
- Ses: fal TTS, OpenAI TTS, ElevenLabs
- Script/LLM: GPT-4o, Gemini 2.0, Claude 3.5

### 5.2 Sistem Mimarisi

```
┌──────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                          │
│                                                               │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌─────────────┐ │
│  │ Landing  │  │  Create  │  │   Chat    │  │  Workspace  │ │
│  │  Page    │  │  Page    │  │ Workspace │  │ Node Editor │ │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬──────┘ │
│       │              │              │               │         │
│       └──────────────┴──────┬───────┴───────────────┘         │
│                             │                                  │
│                    ┌────────▼────────┐                         │
│                    │  Zustand Store  │                         │
│                    │  (project +     │                         │
│                    │   workspace)    │                         │
│                    └────────┬────────┘                         │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                     ┌────────▼────────┐
                     │  Next.js API    │
                     │  Routes         │
                     └────────┬────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
   ┌──────▼──────┐   ┌───────▼───────┐   ┌───────▼───────┐
   │  Supabase   │   │   fal.ai      │   │   Stripe      │
   │  Auth + DB  │   │   AI Models   │   │   Payments    │
   │  + Storage  │   │   (10+ video  │   │               │
   │             │   │    9+ image   │   │               │
   │             │   │    3+ TTS)    │   │               │
   └─────────────┘   └───────────────┘   └───────────────┘
```

### 5.3 Veritabanı Şeması

```sql
-- =============================================
-- PROFILES — Kullanıcı profilleri
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  plan VARCHAR(20) DEFAULT 'free',          -- free, starter, pro, team
  stripe_customer_id VARCHAR(255),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER_CREDITS — Kredi bakiyesi
-- =============================================
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(20) DEFAULT 'free',
  total_credits INTEGER DEFAULT 50,
  used_credits INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREDIT_TRANSACTIONS — Kredi hareketleri (audit log)
-- =============================================
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  amount INTEGER NOT NULL,                   -- negatif = harcama, pozitif = yükleme
  balance_after INTEGER NOT NULL,
  description TEXT,
  node_type VARCHAR(50),                     -- script, voice, imageGen, videoGen
  model_used VARCHAR(100),                   -- flux-schnell, kling-2.5-turbo vb.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROJECTS — Kullanıcı projeleri
-- =============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) DEFAULT 'Untitled Project',
  status VARCHAR(20) DEFAULT 'draft',        -- draft, planning, generating, review, completed
  initial_prompt TEXT,
  style VARCHAR(50),
  voice_id VARCHAR(100),
  duration_seconds INTEGER DEFAULT 30,
  aspect_ratio VARCHAR(10) DEFAULT '16:9',
  ai_model VARCHAR(100),
  total_credits_used INTEGER DEFAULT 0,
  final_video_url TEXT,
  thumbnail_url TEXT,
  workflow_data JSONB,                       -- node canvas state (nodes + edges)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHAT_MESSAGES — AI Direktör sohbet geçmişi
-- =============================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,                 -- user, assistant, system
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  model_used VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SCENES — Sahne detayları
-- =============================================
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scene_order INTEGER NOT NULL,
  title VARCHAR(255),
  script TEXT,
  visual_prompt TEXT,
  notes TEXT,
  duration_seconds INTEGER DEFAULT 5,
  recommended_model VARCHAR(100),
  selected_model VARCHAR(100),
  status VARCHAR(20) DEFAULT 'draft',        -- draft, queued, generating, ready, failed
  image_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  credits_cost INTEGER DEFAULT 0,
  generation_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- GENERATED_ASSETS — Üretilen tüm dosyalar
-- =============================================
CREATE TABLE generated_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id),
  asset_type VARCHAR(20) NOT NULL,           -- image, video, audio, script
  model_used VARCHAR(100) NOT NULL,
  prompt TEXT,
  url TEXT NOT NULL,
  file_size_bytes BIGINT,
  duration_seconds FLOAT,
  width INTEGER,
  height INTEGER,
  credits_cost INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RLS POLİCİES
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_assets ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi verilerini görebilir
CREATE POLICY "Users see own data" ON profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own credits" ON user_credits FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own transactions" ON credit_transactions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own projects" ON projects FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own messages" ON chat_messages FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own scenes" ON scenes FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
CREATE POLICY "Users see own assets" ON generated_assets FOR ALL USING (user_id = auth.uid());

-- Atomik kredi düşürme fonksiyonu
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT '',
  p_node_type TEXT DEFAULT NULL,
  p_model_used TEXT DEFAULT NULL,
  p_project_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_used INTEGER;
BEGIN
  SELECT total_credits - used_credits INTO v_current_balance
  FROM user_credits WHERE user_id = p_user_id FOR UPDATE;

  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE user_credits
  SET used_credits = used_credits + p_amount, updated_at = NOW()
  WHERE user_id = p_user_id;

  v_new_used := (SELECT used_credits FROM user_credits WHERE user_id = p_user_id);

  INSERT INTO credit_transactions (user_id, project_id, amount, balance_after, description, node_type, model_used)
  VALUES (p_user_id, p_project_id, -p_amount,
    (SELECT total_credits FROM user_credits WHERE user_id = p_user_id) - v_new_used,
    p_description, p_node_type, p_model_used);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5.4 Node Sistemi

#### Node Tipleri

| Node | Renk | Giriş | Çıkış | Açıklama |
|------|------|-------|-------|----------|
| **Script** | #FF2D78 | — | Script | LLM ile metin/senaryo üretir |
| **Voice** | #a78bfa | Script | Audio | Metinden konuşma (TTS) |
| **ImageGen** | #FFE744 | Prompt | Image | Prompt'tan görsel üretir |
| **VideoGen** | #D1FE17 | Prompt, Image, Voice | Video | Video üretir |
| **Caption** | #0ea5e9 | Video | Captioned | Altyazı ekler |
| **Export** | #D1FE17 | Video | — | Dışa aktarım |
| **VideoBrief** | #3b82f6 | — | FilmStrip | Tam video brief tanımlama |
| **FilmStrip** | #f59e0b | VideoBrief | Export | Sahne sahne üretim ve önizleme |

#### Gelişmiş Node'lar (v2 - Roadmap)

| Node | Renk | Açıklama |
|------|------|----------|
| **LLM** | #f43f5e | Genel amaçlı dil modeli |
| **Array** | #3b82f6 | Liste/dizi işleme |
| **Router** | #f59e0b | Koşullu dallanma (if/else) |
| **TextIterator** | #10b981 | Dizi üzerinde döngü |
| **SystemPrompt** | #8b5cf6 | Sistem promptu tanımlama |

#### Bağlantı Kuralları (CONNECTION_RULES)
```
script      → [voice, imageGen, videoGen, llm, textIterator, array, router]
voice       → [videoGen, export]
imageGen    → [videoGen, export]
videoGen    → [caption, export]
caption     → [export]
llm         → [script, voice, imageGen, videoGen, array, router, textIterator]
systemPrompt → [llm, script]
array       → [textIterator, router]
textIterator → [script, voice, imageGen, videoGen, llm]
router      → [script, voice, imageGen, videoGen, llm, export]
videoBrief  → [filmStrip]
filmStrip   → [export, caption, array]
export      → []  (terminal node)
```

### 5.5 Execution Engine Akışı

```
User clicks "Execute" (tek node veya tüm workflow)
    ↓
1. getExecutionOrder() — Topolojik sıralama (DAG)
    ↓
2. Her node için sırasıyla:
   a. Status → "pending"
   b. Kredi kontrolü (hasEnoughCredits)
   c. Status → "processing"
   d. buildRequestBody() — Node config → API request
   e. API çağrısı (/api/generate/*)
   f. Sonucu node'a yaz (outputUrl)
   g. Kredi düş (deductCredits)
   h. Status → "ready" veya "failed"
    ↓
3. Sonraki node'a geç (önceki node'un output'unu input olarak al)
    ↓
4. Tüm workflow tamamlandığında → Export node otomatik tetikle
```

---

## 6. MEVCUT DURUM VE GELİŞTİRME PLANI

### Mevcut Tamamlanma Durumu

| Bileşen | Durum | Detay |
|---------|-------|-------|
| Landing Page | ✅ %100 | Tam fonksiyonel, 3D sahne, prompt girişi |
| Create Sayfası | ✅ %100 | 4 mod, stil/ses/ayar seçimi |
| Auth (Giriş/Kayıt) | ✅ %100 | Email + Google OAuth |
| Onboarding | ✅ %90 | 3 adım wizard (isim, niş, plan) |
| Dashboard | ✅ %85 | Proje listesi, kredi özeti, quick start |
| Settings | ✅ %80 | Profil, plan bilgisi, dil tercihi |
| Chat Workspace UI | ✅ %90 | Streaming chat çalışıyor |
| Chat → Sahne Planlama | ⚠️ %40 | JSON sahne planı üretiliyor ama render zayıf |
| Node Canvas UI | ✅ %90 | Tüm node tipleri, bağlantılar, detay paneli |
| Node Execution (Tek Node) | ✅ %80 | executeSingleNode() çalışıyor, API route'lar kredi kontrollü |
| Node Execution (Pipeline) | ❌ %10 | executePipeline() dead code, n8n bağımlısıydı |
| fal.ai Entegrasyonu | ✅ %95 | 14 video + 9 görsel + 3 TTS + 3 LLM model tanımlı |
| API Routes (Generate) | ✅ %85 | Image, Video, Script, TTS → kredi check + deduct çalışıyor |
| API Route (Caption) | ❌ %5 | Placeholder — kredi alır ama null döndürür |
| Kredi Sistemi | ⚠️ %50 | İKİ AYRI SİSTEM ÇAKIŞIYOR + mock veri dönen endpoint |
| Proje Kaydetme (DB) | ⚠️ %60 | CRUD var, auto-save var ama UI bağlantısı zayıf |
| Pricing Sayfası | ✅ %90 | Planlar, fiyatlar, kredi tablosu |
| Stripe Ödeme | ⚠️ %30 | Checkout route var, webhook kredi yüklemez |
| n8n Entegrasyonu | ❌ KALDIRILACAK | Pipeline route + n8n-client + webhook callback |
| VideoBrief + FilmStrip | ⚠️ %70 | UI detaylı, script üretimi çalışıyor, media üretimi kısmen |
| i18n | ⚠️ %30 | Altyapı hazır, çoğu metin hardcoded |

---

### GELİŞTİRME PLANI: UX-FIRST YAKLAŞIM

> **Felsefe:** Önce kullanıcı istediği çıktıyı alsın. Ödeme sonra gelir.
> Bir kullanıcı uygulamaya geldiğinde prompt yazıp → video/görsel/script üretip → sonucu indirmeli.

---

#### 🔴 FAZ 0: Temizlik (1 gün)
**Hedef:** Kodu temizle, çakışmaları kaldır, sağlam bir temel oluştur

**0.1 n8n Bağımlılığını Kaldır**
- [ ] `lib/ai/n8n-client.ts` dosyasını sil
- [ ] `app/api/webhooks/n8n-callback/route.ts` dosyasını sil
- [ ] `app/api/pipeline/start/route.ts` → n8n çağrısını kaldır, execution-engine'e yönlendir
- [ ] `docs/N8N_KURULUM_REHBERI.md` sil
- [ ] `docs/n8n-workflows/` klasörünü sil
- [ ] Workspace page'deki n8n yorumunu temizle

**0.2 Kredi Sistemi Birleştir**
- [ ] `lib/credits/credit-system.ts` (DEPRECATED) → sil veya redirect dosyası yap
- [ ] `app/api/credits/route.ts` → deprecated import'u kaldır, `services/credits.ts` kullan
- [ ] Hardcoded mock yanıtı kaldır (GET: `{ total: 2000, remaining: 1653 }`)
- [ ] Gerçek Supabase bakiyesi döndür

**0.3 Ölü Kodu Temizle**
- [ ] `lib/openai.ts` → kullanılmayan `generateChatResponse()` ve `generateScript()` temizle
- [ ] `app/api/generate/caption/route.ts` → placeholder'ı kaldır (kredi alıp null döndürmesin)
- [ ] `pricing.ts` ↔ `fal-client.ts` kredi maliyetlerini senkronize et

---

#### 🟢 FAZ 1: Tek Node Üretim UX (2-3 gün)
**Hedef:** Kullanıcı workspace'e gelir, tek bir node ile içerik üretir, sonucu görür

> Kullanıcı senaryosu: Workspace aç → ImageGen node ekle → prompt yaz → model seç → "Run" tıkla → görsel çıktıyı gör

**1.1 Node Execution Düzeltmeleri**
- [ ] executeSingleNode() → API route çağrısını doğrula (image, video, script, tts)
- [ ] Node status animasyonları (idle → processing spinner → ready yeşil ✓ → failed kırmızı ✗)
- [ ] Üretim sonucu node içinde göster (görsel → thumbnail, video → player, ses → audio player, script → text preview)
- [ ] Hata durumunda toast + node üzerinde hata mesajı

**1.2 Workspace UX İyileştirmesi**
- [ ] NodePalette'i sol kenar çubuğunda her zaman görünür yap (şu an gizli)
- [ ] Sağ tık context menu'ye "hızlı node ekle" talimatı
- [ ] NodeDetailPanel'de "Run" butonu belirgin olsun (yeşil, büyük)
- [ ] Kredi maliyetini node üzerinde göster ("~25 kredi" badge)

**1.3 Sonuç İndirme**
- [ ] Üretilen görseli/videoyu indirme butonu (node içinde)
- [ ] "Open in new tab" linki
- [ ] Basit paylaşma linki (URL kopyala)

---

#### 🟡 FAZ 2: Workflow Execution — Zincir Üretim (2-3 gün)
**Hedef:** Birden fazla node bağlayıp sırasıyla çalıştır

> Kullanıcı senaryosu: Script node → Voice node → VideoGen node → Export
> Script üretilir → otomatik olarak Voice'a akar → Video üretilir

**2.1 Pipeline Execution Engine**
- [ ] `executePipeline()` fonksiyonunu aktifleştir (dead code → working code)
- [ ] Topolojik sıralama ile node'ları sırasıyla çalıştır
- [ ] Önceki node çıktısını sonraki node'a otomatik aktar
  - Script node outputUrl → Voice node'a text girişi
  - Voice node audioUrl → VideoGen node'a audio girişi
  - ImageGen node imageUrl → VideoGen node'a image2video girişi
- [ ] Pipeline progress bar (3/5 node tamamlandı gibi)

**2.2 Workspace "Run All" Butonu**
- [ ] Toolbar'a "▶ Run Pipeline" butonu ekle
- [ ] Tüm bağlı node'ları sırasıyla çalıştır
- [ ] Toplam kredi tahmini göster ("Bu pipeline ~85 kredi kullanacak")
- [ ] Yetersiz kredi uyarısı

**2.3 Proje Kaydetme**
- [ ] Save butonu → workflow_data (nodes + edges) → Supabase projects tablosu
- [ ] Dashboard'dan proje aç → workspace'e nodes/edges yükle
- [ ] Auto-save (30sn debounce, sadece değişiklik varsa)

---

#### 🔵 FAZ 3: Chat → Workspace Akışı (2-3 gün)
**Hedef:** AI Direktör ile planlama → otomatik node workflow

> Kullanıcı senaryosu: Landing page'de "30sn ürün tanıtımı" yaz → Chat açılır →
> AI Direktör 4 sahne planlar → "Onayla" tıkla → Workspace'te 4 sahnelik pipeline hazır

**3.1 Sahne Parse & Render**
- [ ] Chat AI yanıtından JSON sahne planını parse et
- [ ] Sağ panelde sahne kartları render et (başlık, süre, görsel prompt, model önerisi)
- [ ] Her sahne için "Onayla" / "Düzenle" / "Sil" butonları

**3.2 Sahne → Otomatik Node Workflow**
- [ ] "Tüm Sahneleri Onayla" butonu
- [ ] Her sahne için otomatik node zinciri oluştur:
  Script → ImageGen → VideoGen (edge'lerle bağlı)
- [ ] Workspace sayfasına otomatik yönlendir
- [ ] Node'lar sahne bilgileriyle pre-populated (prompt, model, süre)

**3.3 VideoBrief + FilmStrip Entegrasyonu**
- [ ] VideoBrief node → script generate → FilmStrip node otomatik oluşsun
- [ ] FilmStrip'te sahne sahne media üretimi (image → audio → video sırasıyla)
- [ ] Tam video önizleme (tüm sahneler sıralı)

---

#### ⚪ FAZ 4: Polish & Demo-Ready (2-3 gün)
**Hedef:** Başkasına gösterilebilir, kusursuz deneyim

**4.1 UX Detayları**
- [ ] Loading skeleton'lar (dashboard, workspace yüklenirken)
- [ ] Error boundary'ler (sayfa çökmesi yerine hata mesajı)
- [ ] Toast bildirimleri tutarlı hale getir (başladı, devam ediyor, tamamlandı, hata)
- [ ] Boş state'ler (dashboard'da proje yoksa yönlendirme)
- [ ] Mobil uyarı banner'ı ("Desktop'ta daha iyi deneyim")

**4.2 Dashboard ↔ Workspace Bağlantısı**
- [ ] Dashboard'dan proje tıkla → workspace'te aç
- [ ] Workspace'ten dashboard'a dön butonu
- [ ] Proje durumu dashboard'da güncel (Draft, Generating, Completed)
- [ ] Son üretilen asset'lerin thumbnail'ı dashboard'da

**4.3 Onboarding Akışı Kontrolü**
- [ ] Kayıt sonrası onboarding → ilk prompt deneyimi → workspace
- [ ] Ücretsiz 50 kredi otomatik yüklensin (DB'de)
- [ ] Onboarding tamamlanmadan workspace'e gidememe

**4.4 Temel Vercel Deploy**
- [ ] Production build hatasız çalışsın
- [ ] Environment variables ayarla
- [ ] Custom domain (opsiyonel)

---

#### 💰 FAZ 5: Ödeme Sistemi (Sonra)
**Hedef:** Sistem çalıştıktan sonra gelir modeli aktifleştir

- [ ] Stripe webhook → addCredits() bağlantısı
- [ ] Plan yükseltme akışı
- [ ] Aylık kredi reset
- [ ] Stripe Customer Portal
- [ ] Fatura / receipt e-mail

#### 🚀 FAZ 6: Büyüme (Çok Sonra)
**Hedef:** Kullanıcı tabanını büyütme

- [ ] AI Avatar üretimi
- [ ] Ses klonlama
- [ ] Template marketplace
- [ ] API erişimi
- [ ] Ekip workspace'leri
- [ ] Product Hunt lansmanı
- [ ] SEO / Blog

---

## 7. RAKİP ANALİZİ

| Özellik | Runway | Pika | Kling (web) | Creavidy |
|---------|--------|------|-------------|----------|
| **Video Üretimi** | ✅ | ✅ | ✅ | ✅ |
| **Görsel Üretimi** | ✅ | ❌ | ❌ | ✅ |
| **Script Üretimi** | ❌ | ❌ | ❌ | ✅ |
| **TTS / Seslendirme** | ❌ | ❌ | ❌ | ✅ |
| **Çoklu Model Desteği** | 1 model | 1 model | 1 model | **10+ model** |
| **Node Workflow** | ❌ | ❌ | ❌ | ✅ |
| **AI Direktör Chat** | ❌ | ❌ | ❌ | ✅ |
| **Fiyat (Başlangıç)** | $12/ay | $8/ay | $5.99/ay | **$19/ay** |
| **Uçtan Uca Pipeline** | ❌ | ❌ | ❌ | ✅ |

### Creavidy'nin Farkı
1. **All-in-one:** Video + Görsel + Script + Ses tek platformda
2. **Çoklu model:** Kullanıcı istediği AI modelini seçer, karşılaştırır
3. **Node workflow:** Profesyonel kullanıcılar için görsel pipeline editörü
4. **AI Direktör:** Chat ile rehberli içerik üretimi (başlangıç kullanıcıları için)
5. **Maliyet şeffaflığı:** Her model için net kredi maliyeti, sürpriz fatura yok

### Risk Faktörleri
1. **fal.ai bağımlılığı:** Tüm modeller tek sağlayıcı üzerinden — fal.ai kesintisi = platform kesintisi
2. **Fiyat rekabeti:** Runway $12, Pika $8 — Creavidy $19 ama daha fazla özellik sunmalı
3. **Model kalitesi:** fal.ai üzerinden erişilen modeller direkt API kadar iyi olmayabilir
4. **Büyük oyuncular:** Google (Veo), OpenAI (Sora), Adobe — kendi platformlarını yapabilir
5. **Churn:** AI araçlarında kullanıcı sadakati düşük, sürekli yenilik gerekli

### Hafifletme Stratejileri
1. Workflow + all-in-one değer önerisi ile fiyat farkını meşrulaştır
2. Birden fazla AI sağlayıcı entegre et (fal.ai + direkt API fallback)
3. Kullanıcı üretimlerini saklayarak switching cost oluştur
4. Topluluk + template marketplace ile ağ etkisi yarat

---

## 8. BAŞARI METRİKLERİ (KPI)

### Ürün Metrikleri
| Metrik | Hedef (3 Ay) | Hedef (6 Ay) |
|--------|-------------|-------------|
| Kayıtlı kullanıcı | 1.200 | 6.000 |
| DAU / MAU oranı | %15 | %20 |
| Ortalama session süresi | 8 dk | 12 dk |
| Üretim/kullanıcı/hafta | 3 | 5 |
| Workflow kaydetme oranı | %30 | %50 |

### İş Metrikleri
| Metrik | Hedef (3 Ay) | Hedef (6 Ay) |
|--------|-------------|-------------|
| MRR | $3.400 | $25.600 |
| Free → Paid dönüşüm | %10 | %15 |
| Churn (aylık) | <%8 | <%5 |
| CAC (Customer Acquisition Cost) | <$15 | <$10 |
| LTV / CAC oranı | >3x | >5x |

### Teknik Metrikler
| Metrik | Hedef |
|--------|-------|
| API uptime | >%99.5 |
| Ortalama üretim süresi (video) | <120 saniye |
| Sayfa yüklenme (LCP) | <2.5 saniye |
| Hata oranı | <%2 |

---

## 9. EK: DOSYA YAPISI

```
creavidy/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx                    # Landing page
│   │   ├── create/page.tsx             # Create modu seçimi
│   │   ├── chat/page.tsx               # AI Direktör chat workspace
│   │   ├── workspace/[projectId]/page.tsx  # Node editörü
│   │   ├── pricing/page.tsx            # Fiyatlandırma
│   │   ├── dashboard/page.tsx          # Proje listesi + kredi özeti
│   │   ├── settings/page.tsx           # Profil + plan + dil
│   │   ├── onboarding/page.tsx         # 3 adım wizard
│   │   ├── auth/
│   │   │   ├── sign-in/page.tsx
│   │   │   ├── sign-up/page.tsx
│   │   │   └── callback/route.ts
│   │   └── layout.tsx
│   ├── api/
│   │   ├── chat/route.ts               # GPT-4o streaming chat
│   │   ├── generate/
│   │   │   ├── image/route.ts           # Görsel üretim
│   │   │   ├── video/route.ts           # Video üretim
│   │   │   ├── script/route.ts          # Script üretim
│   │   │   └── tts/route.ts             # Ses üretim
│   │   ├── projects/
│   │   │   ├── route.ts                 # Proje CRUD
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── chat/route.ts
│   │   ├── checkout/route.ts            # Stripe checkout
│   │   ├── credits/route.ts             # Kredi sorgulama
│   │   ├── upload/voice/route.ts        # Ses dosyası yükleme
│   │   └── webhooks/stripe/route.ts     # Stripe webhook
│   ├── globals.css
│   └── favicon.ico
├── components/
│   ├── ui/                              # Temel UI bileşenleri
│   ├── chat/                            # Chat bileşenleri
│   ├── create/                          # Create sayfa bileşenleri
│   └── workspace/                       # Node editörü bileşenleri
│       ├── NodeCanvas.tsx
│       ├── NodePalette.tsx
│       ├── NodeDetailPanel.tsx
│       ├── CanvasContextMenu.tsx
│       ├── nodes/
│       │   ├── CustomNodes.tsx
│       │   └── CapCutNodes.tsx
│       └── edges/LabeledEdge.tsx
├── lib/
│   ├── ai/
│   │   ├── fal-client.ts                # fal.ai wrapper
│   │   └── execution-engine.ts          # Node execution engine
│   ├── stores/
│   │   ├── project-store.ts             # Zustand proje state
│   │   └── workspace-store.ts           # Zustand workspace state
│   ├── services/
│   │   └── credits.ts                   # Kredi işlemleri (TEK KAYNAK)
│   ├── constants/
│   │   └── pricing.ts                   # Fiyat sabitleri
│   ├── supabase/
│   │   ├── client.ts                    # Browser client
│   │   └── server.ts                    # Server client
│   ├── openai.ts                        # OpenAI client
│   ├── stripe.ts                        # Stripe client
│   └── utils.ts                         # Yardımcı fonksiyonlar
├── supabase/
│   ├── schema.sql
│   └── migrations/
├── messages/
│   ├── en.json
│   └── tr.json
├── public/
├── hooks/
├── middleware.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

---

## 10. MİMARİ KARAR: n8n YOK, DİREKT fal.ai

### Neden n8n Çıkarıldı?
1. Docker bağımlılığı ekliyordu (deploy karmaşıklığı)
2. ngrok gerekiyordu (webhook callback için)
3. Aynı işi execution-engine.ts zaten yapabiliyor
4. Tek fail point ekliyordu (n8n çökerse → platform çöker)

### Yeni Execution Akışı
```
Kullanıcı "Run" tıklar (tek node veya pipeline)
    ↓
execution-engine.ts
    ↓
1. getExecutionOrder() → Topolojik sıralama (DAG)
    ↓
2. Her node için:
   a. checkBalance(userId, creditCost)
   b. Node status → "processing" (UI'da spinner)
   c. fetch('/api/generate/{type}', payload)
   d. fal.ai direkt çağrı (Next.js API route içinde)
   e. deductCredit(userId, cost)
   f. Node status → "ready" + outputUrl (UI'da sonuç)
    ↓
3. Sonraki node'a önceki node'un çıktısını aktar
    ↓
4. Tüm node'lar tamamlandığında → Export ready
```

### Timeout Stratejisi
- Görsel üretimi: ~5-15 sn (sorun yok)
- Video üretimi: ~30-120 sn (uzun olabilir)
- Çözüm: API route'larda 120sn timeout + UI'da polling/progress indicator
- Gelecek: Uzun işler için queue sistemi (BullMQ veya Supabase Edge Functions)

---

**Son Güncelleme:** 2026-03-08
**Sonraki Güncelleme:** Faz 0 tamamlandığında
