# ⚙️ Creavidy v2 — Teknik Gereksinimler & Flow Dokümanı

> Bu doküman, projenin tüm teknik gereksinimlerini, API spesifikasyonlarını, veri akışlarını ve sistem flow'larını detaylı olarak tanımlar. Geliştirme referans dokümanı olarak kullanılacaktır.
> 

---

## 1. Sistem Gereksinimleri Özeti

### 1.1 Altyapı Gereksinimleri

| Bileşen | Teknoloji | Versiyon | Amaç |
| --- | --- | --- | --- |
| Frontend Framework | Next.js | 15+ (App Router) | Creator Dashboard, Landing Page |
| UI Kit | shadcn/ui + Tailwind CSS | Latest | Bileşen kütüphanesi |
| Animasyon | Framer Motion | 11+ | UI geçişleri, swipe mekanizması |
| Backend / BaaS | Supabase | Latest | Auth, DB, Storage, Realtime, Edge Functions |
| Workflow Engine | n8n | 2.x (self-hosted Docker) | Tüm otomasyon ve orkestrasyon |
| LLM | OpenAI GPT-4o-mini | gpt-4o-mini-2024-07-18 | Senaryo üretimi, niyet sınıflandırma |
| TTS (Ses) | ElevenLabs | v1 API | Ses klonlama ve text-to-speech |
| Video Üretimi (MVP) | HeyGen | v2 API | Avatar video üretimi |
| Video Üretimi (Faz 2) | MuseTalk + LivePortrait | Open-source | Self-hosted lip-sync video |
| GPU (Faz 2) | RunPod Serverless | Latest | MuseTalk inference |
| CDN / Storage | Cloudflare R2 veya Supabase Storage | - | Video dosyaları |
| Domain / Hosting | Vercel | - | Next.js deployment |
| Monitoring | Sentry | - | Hata takibi |

### 1.2 Geliştirme Ortamı

| Araç | Amaç |
| --- | --- |
| Cursor IDE | AI-destekli kod geliştirme |
| n8n (Docker - [localhost:5678](http://localhost:5678)) | Workflow geliştirme ve test |
| Supabase CLI | Lokal DB geliştirme |
| Postman / Insomnia | API test |
| GitHub | Versiyon kontrolü |

---

## 2. API Gereksinimleri ve Spesifikasyonlar

### 2.1 YouTube Data API v3

**Gerekli OAuth Scopes:**

```
https://www.googleapis.com/auth/youtube.readonly
https://www.googleapis.com/auth/youtube.force-ssl
https://www.googleapis.com/auth/youtube.upload
```

**Endpoint Kataloğu:**

**A) Yorum Okuma — `commentThreads.list`**

```
GET https://www.googleapis.com/youtube/v3/commentThreads
Parametreler:
  part: snippet,replies
  allThreadsRelatedToChannelId: {channel_id}
  maxResults: 100
  order: time
  moderationStatus: published
  pageToken: {next_page_token}

Kota: 1 ünite/istek
Rate Limit: Saniyede 10 istek
Yanıt Boyutu: ~2KB/yorum
```

**Üye Rozet Algılama Yöntemi:**

Yorum snippet içindeki `authorChannelId` ile `memberships.list` karşılaştırması yapılır. Alternatif: Yorum metninde üye badge unicode karakteri kontrolü veya YouTube Studio internal API.

**B) Yorum Yazma — `comments.insert`**

```
POST https://www.googleapis.com/youtube/v3/comments
part: snippet
Body:
{
  "snippet": {
    "parentId": "{comment_thread_id}",
    "textOriginal": "Sana özel bir video hazırladım! 🎬 {video_link} [AI-assisted response]"
  }
}

Kota: 50 ünite/istek
Rate Limit: Saniyede 1 istek (güvenli)
```

**C) Kanal Bilgileri — `channels.list`**

```
GET https://www.googleapis.com/youtube/v3/channels
Parametreler:
  part: snippet,statistics,brandingSettings
  mine: true

Kota: 1 ünite/istek
```

**D) Üyelik Kontrolü — `members.list`**

```
GET https://www.googleapis.com/youtube/v3/members
Parametreler:
  part: snippet
  mode: list_members
  maxResults: 1000

Kota: 1 ünite/istek
NOT: YouTube Channel Memberships API aktif olması gerekir
```

**Günlük Kota Bütçesi (10.000 ünite):**

| İşlem | Sıklık | Birim Maliyet | Günlük Toplam |
| --- | --- | --- | --- |
| commentThreads.list | 96x (her 15dk) | 1 | 96 |
| members.list | 96x (her 15dk) | 1 | 96 |
| comments.insert | ~50 yanıt/gün | 50 | 2.500 |
| channels.list | 4x/gün | 1 | 4 |
| **TOPLAM** |  |  | **~2.696** |
| **Kalan Kota** |  |  | **7.304 (73%)** |

### 2.2 HeyGen API (MVP Video Motor)

**Gerekli Endpoint'ler:**

**A) Avatar Oluşturma — Instant Avatar**

```
POST https://api.heygen.com/v2/photo_avatar/create
Headers:
  X-Api-Key: {HEYGEN_API_KEY}
Body:
{
  "image_url": "{creator_photo_url}",
  "name": "{creator_name}_avatar"
}

Yanıt: { "avatar_id": "xxx" }
Süre: ~2-5 dakika
```

**B) Video Üretimi**

```
POST https://api.heygen.com/v2/video/generate
Body:
{
  "video_inputs": [{
    "character": {
      "type": "avatar",
      "avatar_id": "{avatar_id}",
      "avatar_style": "normal"
    },
    "voice": {
      "type": "audio",
      "audio_url": "{elevenlabs_audio_url}"
    },
    "background": {
      "type": "color",
      "value": "#1a1a2e"
    }
  }],
  "dimension": {
    "width": 720,
    "height": 1280
  },
  "aspect_ratio": "9:16"
}

Yanıt: { "video_id": "xxx" }
Üretim Süresi: 30-120 saniye
```

**C) Video Durum Sorgulama**

```
GET https://api.heygen.com/v1/video_status.get?video_id={video_id}

Yanıt Durumları:
  - pending: Kuyrukta
  - processing: İşleniyor
  - completed: Hazır (video_url döner)
  - failed: Hata (error mesajı döner)

Polling Stratejisi: 10sn aralıkla, max 5dk timeout
```

**HeyGen Maliyet Hesabı:**

| Plan | Fiyat | Kredi | Video Kapasitesi |
| --- | --- | --- | --- |
| Creator | $29/ay | 15 kredi | ~15 video (1dk) |
| Business | $89/ay | 60 kredi | ~60 video (1dk) |
| Enterprise | Custom | Custom | Sınırsız |

**MVP İçin Tavsiye:** Business plan ($89/ay) → ~60 video/ay. İlk beta için yeterli. Ölçekte self-hosted'a geçiş zorunlu.

### 2.3 ElevenLabs API

**A) Ses Klonlama (Instant Voice Clone)**

```
POST https://api.elevenlabs.io/v1/voices/add
Headers:
  xi-api-key: {ELEVENLABS_API_KEY}
Content-Type: multipart/form-data
Body:
  name: "{creator_name}_voice"
  files: [audio_sample.mp3]  (min 1dk, ideal 3-5dk)
  description: "YouTube creator voice clone"
  labels: {"accent": "turkish", "gender": "male"}

Yanıt: { "voice_id": "xxx" }
```

**B) Text-to-Speech**

```
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
Headers:
  xi-api-key: {ELEVENLABS_API_KEY}
Body:
{
  "text": "{senaryo_metni}",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.8,
    "style": 0.3,
    "use_speaker_boost": true
  }
}

Yanıt: audio/mpeg stream (MP3)
Ortalama Süre: 2-5 saniye
```

**ElevenLabs Maliyet Hesabı:**

| Plan | Fiyat | Karakter | Video Kapasitesi (~50 kelime/video) |
| --- | --- | --- | --- |
| Starter | $5/ay | 30.000 | ~100 video |
| Creator | $22/ay | 100.000 | ~330 video |
| Pro | $99/ay | 500.000 | ~1.650 video |

**MVP İçin Tavsiye:** Creator plan ($22/ay) yeterli.

### 2.4 OpenAI API

**A) Senaryo Üretimi**

```
POST https://api.openai.com/v1/chat/completions
Body:
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "Sen {creator_name} isimli bir YouTube creator'ın dijital ikizi olarak konuşuyorsun. Ton: {persona_prompt}. Bilgi tabanı: {knowledge_base}. Her yanıt 5-10 saniye konuşma uzunluğunda (40-80 kelime) olmalı. Doğal, samimi ve kişisel ol. Üyenin ismini kullan."
    },
    {
      "role": "user", 
      "content": "Yeni üye bilgileri:\nİsim: {member_name}\nÜyelik tarihi: {join_date}\nTip: welcome\n\nKişiselleştirilmiş hoş geldin senaryosu yaz."
    }
  ],
  "temperature": 0.8,
  "max_tokens": 200
}
```

**B) Niyet Sınıflandırma**

```
POST https://api.openai.com/v1/chat/completions
Body:
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "Aşağıdaki YouTube yorumunu sınıflandır. Sadece JSON döndür: {\"intent\": \"question|praise|complaint|suggestion|spam\", \"priority\": 1-10, \"sentiment\": -1 to 1, \"video_worthy\": true|false, \"reason\": \"kısa açıklama\"}"
    },
    {
      "role": "user",
      "content": "{comment_text}"
    }
  ],
  "temperature": 0.1,
  "max_tokens": 100,
  "response_format": { "type": "json_object" }
}
```

**C) Moderasyon Kontrolü**

```
POST https://api.openai.com/v1/moderations
Body:
{
  "input": "{generated_script_text}"
}

Kontrol Edilen Kategoriler:
  - hate, hate/threatening
  - self-harm
  - sexual, sexual/minors
  - violence, violence/graphic
  - harassment

Karar: herhangi biri true ise → video üretme, loglama yap
```

**OpenAI Maliyet Hesabı:**

| İşlem | Token/İstek | İstek/Ay | Aylık Maliyet |
| --- | --- | --- | --- |
| Senaryo üretimi | ~400 token | 500 | ~$0.30 |
| Niyet sınıflandırma | ~200 token | 2.000 | ~$0.60 |
| Moderasyon | Free | 500 | $0.00 |
| **TOPLAM** |  |  | **~$0.90/ay** |

---

## 3. Veritabanı Gereksinimleri (Supabase/PostgreSQL)

### 3.1 Tablo Şemaları (SQL)

```sql
-- Creator tablosu
CREATE TABLE creators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  youtube_channel_id TEXT UNIQUE,
  youtube_channel_name TEXT,
  youtube_access_token TEXT, -- encrypted
  youtube_refresh_token TEXT, -- encrypted
  youtube_token_expires_at TIMESTAMPTZ,
  avatar_id TEXT, -- HeyGen avatar reference
  voice_id TEXT, -- ElevenLabs voice reference
  persona_prompt TEXT DEFAULT 'Samimi ve enerjik',
  knowledge_base JSONB DEFAULT '{}',
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter','creator','pro','agency')),
  monthly_video_count INT DEFAULT 0,
  monthly_video_limit INT DEFAULT 10,
  billing_cycle_start DATE,
  is_active BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Üye tablosu
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  youtube_channel_id TEXT,
  youtube_display_name TEXT,
  youtube_profile_image TEXT,
  member_since TIMESTAMPTZ,
  tier_level INT DEFAULT 1,
  total_comments INT DEFAULT 0,
  total_videos_received INT DEFAULT 0,
  sentiment_score DECIMAL(5,2) DEFAULT 50.00,
  last_comment_at TIMESTAMPTZ,
  last_video_sent_at TIMESTAMPTZ,
  welcome_video_sent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notes TEXT, -- creator'ın özel notu
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creator_id, youtube_channel_id)
);

-- Yorum tablosu
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  youtube_comment_id TEXT UNIQUE,
  youtube_video_id TEXT,
  youtube_video_title TEXT,
  comment_text TEXT NOT NULL,
  is_member_comment BOOLEAN DEFAULT false,
  intent_type TEXT CHECK (intent_type IN ('question','praise','complaint','suggestion','spam')),
  priority_score INT DEFAULT 5 CHECK (priority_score BETWEEN 1 AND 10),
  sentiment DECIMAL(3,2) DEFAULT 0.00,
  video_worthy BOOLEAN DEFAULT false,
  response_status TEXT DEFAULT 'pending' CHECK (response_status IN ('pending','draft_created','responded','skipped')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video yanıt tablosu
CREATE TABLE video_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  comment_id UUID REFERENCES comments(id),
  type TEXT NOT NULL CHECK (type IN ('welcome','reply','milestone','announcement')),
  script_text TEXT NOT NULL,
  script_version INT DEFAULT 1,
  audio_url TEXT,
  video_url TEXT,
  video_duration_seconds INT,
  heygen_video_id TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','generating','pending_approval','approved','sending','sent','rejected','failed')),
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  youtube_reply_id TEXT,
  delivery_method TEXT CHECK (delivery_method IN ('comment_reply','community_post','direct_message')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analitik log tablosu
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES creators(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bildirim tablosu
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT CHECK (type IN ('approval_pending','video_sent','error','system','milestone')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 İndeksler

```sql
CREATE INDEX idx_members_creator ON members(creator_id);
CREATE INDEX idx_members_welcome ON members(creator_id, welcome_video_sent) WHERE welcome_video_sent = false;
CREATE INDEX idx_comments_creator_member ON comments(creator_id, is_member_comment);
CREATE INDEX idx_comments_priority ON comments(creator_id, priority_score DESC) WHERE response_status = 'pending';
CREATE INDEX idx_video_responses_status ON video_responses(creator_id, status);
CREATE INDEX idx_video_responses_approval ON video_responses(creator_id, status) WHERE status = 'pending_approval';
CREATE INDEX idx_analytics_creator_type ON analytics_events(creator_id, event_type);
```

### 3.3 Row Level Security (RLS)

```sql
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_responses ENABLE ROW LEVEL SECURITY;

-- Creator sadece kendi verisini görebilir
CREATE POLICY "creator_own_data" ON creators
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "creator_own_members" ON members
  FOR ALL USING (creator_id = auth.uid());

CREATE POLICY "creator_own_comments" ON comments
  FOR ALL USING (creator_id = auth.uid());

CREATE POLICY "creator_own_videos" ON video_responses
  FOR ALL USING (creator_id = auth.uid());
```

### 3.4 Realtime Subscriptions

```sql
-- Dashboard için canlı güncellemeler
ALTER PUBLICATION supabase_realtime ADD TABLE video_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE members;
```

---

## 4. Detaylı Teknik Flow Diyagramları

### 4.1 Onboarding Flow

```
Creator Landing Page'e gelir
        │
        ▼
[1] "Start Free Trial" tıklar
        │
        ▼
[2] Supabase Auth — Google OAuth ile kayıt
        │
        ▼
[3] YouTube OAuth 2.0 — Kanal bağlama
    │   Scopes: youtube.readonly, youtube.force-ssl
    │
    ├── BAŞARILI ──────────────────────────┐
    │                                      ▼
    │                           [4] Kanal bilgileri çekilir
    │                               channels.list (mine=true)
    │                               → channel_id, name, subs,
    │                                 member_count
    │                                      │
    │                                      ▼
    │                           [5] Avatar Setup Ekranı
    │                               → Webcam ile 2dk video kaydet
    │                               → VEYA video dosyası yükle
    │                                      │
    │                                      ▼
    │                           [6] HeyGen API → Avatar oluştur
    │                               POST /v2/photo_avatar/create
    │                               → avatar_id alınır
    │                               → Önizleme gösterilir
    │                                      │
    │                                      ▼
    │                           [7] ElevenLabs → Ses klonlama
    │                               POST /v1/voices/add
    │                               → voice_id alınır
    │                               → Test cümlesi dinletilir
    │                                      │
    │                                      ▼
    │                           [8] Persona Ayarları
    │                               → Ton seçimi (dropdown)
    │                               → Knowledge base (textarea)
    │                               → Test video üret butonu
    │                                      │
    │                                      ▼
    │                           [9] Supabase UPDATE creators
    │                               onboarding_completed = true
    │                                      │
    │                                      ▼
    │                           [10] Dashboard'a yönlendir
    │                                "Tebrikler! AI ikiziniz hazır."
    │
    └── BAŞARISIZ ─────────────────────────┐
                                           ▼
                                   Hata mesajı + tekrar dene
```

### 4.2 End-to-End Video Üretim Flow

```
[Zaman: T+0dk]

    n8n Cron Tetiklenir (her 15dk)
            │
            ▼
    YouTube API → members.list çağrısı
    Tüm aktif creator'lar için döngü
            │
            ▼
    Supabase → Mevcut üyelerle karşılaştır
    Yeni üyeleri belirle
            │
            ├── Yeni üye YOK → Workflow biter
            │
            └── Yeni üye VAR (örn: 3 yeni üye)
                    │
                    ▼
            Her yeni üye için paralel işlem:

[Zaman: T+1dk]

            ┌─────────────────────────┐
            │ Üye 1: "Ahmet"          │
            │                         │
            │ [A] Supabase INSERT      │
            │     members tablosuna    │
            │                         │
            │ [B] OpenAI GPT-4o-mini   │
            │     Senaryo üret:        │
            │     "Merhaba Ahmet!      │
            │      Kanalıma üye        │
            │      olduğun için çok    │
            │      mutluyum! ..."      │
            │     (~2 saniye)          │
            │                         │
            │ [C] OpenAI Moderation    │
            │     Güvenlik kontrolü    │
            │     (~0.5 saniye)        │
            │                         │
            │ [D] ElevenLabs TTS       │
            │     Ses dosyası üret     │
            │     → audio.mp3 (8sn)   │
            │     (~3 saniye)          │
            │                         │
            │ [E] HeyGen Video         │
            │     Avatar + Ses → Video │
            │     → video.mp4 (8sn)   │
            │     (~60-90 saniye)      │
            │                         │
            │ [F] Supabase INSERT      │
            │     video_responses      │
            │     status:              │
            │     pending_approval     │
            └─────────────────────────┘

[Zaman: T+3dk]  (tüm videolar hazır)

            n8n → Notification gönder
            "3 yeni hoş geldin videosu
             onayınızı bekliyor 🎬"
            │
            ▼

[Zaman: T+?]  (Creator müsait olduğunda)

            Creator Dashboard'u açar
            Onay Kuyruğu'na gider
            │
            ▼
            Kart 1/3: Ahmet'in videosu
            ├── Video önizleme oynatılır
            ├── Senaryo metni gösterilir
            ├── Üye profili gösterilir
            │
            ├── ➡️ Sağa kaydır → ONAYLA
            │   → Supabase UPDATE
            │     status = 'approved'
            │   → n8n Workflow 3 tetiklenir
            │
            ├── ⬅️ Sola kaydır → REDDET
            │   → Supabase UPDATE
            │     status = 'rejected'
            │
            └── ✏️ Düzenle butonu
                → Senaryo düzenleme modal
                → Yeni senaryo → Yeniden üret
                → status = 'draft' → Pipeline tekrar

[Zaman: T+? + Jitter(5-30dk)]

            n8n Workflow 3: Gönderim
            │
            ▼
            Rastgele 5-30dk bekleme
            │
            ▼
            YouTube API → comments.insert
            "Hey Ahmet! 🎬 Sana özel
             bir video hazırladım:
             {video_link}
             [AI-assisted response]"
            │
            ▼
            Supabase UPDATE
            status = 'sent'
            sent_at = NOW()
            │
            ▼
            Analytics log kaydı
            event_type: 'video_sent'
```

### 4.3 Hata Yönetim Flow'u

```
Her adımda hata kontrolü:

[YouTube API Hatası]
    ├── 403 Quota Exceeded → Sonraki cron döngüsüne ertele
    ├── 401 Token Expired → Token refresh akışı başlat
    │   └── Refresh başarısız → Creator'a "Yeniden bağlanın" bildirimi
    └── 5xx Server Error → 3 deneme, exponential backoff (5s, 15s, 45s)

[HeyGen API Hatası]
    ├── Video generation failed → Log + Creator'a bildir
    ├── Timeout (>5dk) → İptal et + yeniden kuyruğa al
    └── Rate limit → 60sn bekle + tekrar dene

[ElevenLabs Hatası]
    ├── Character limit exceeded → Plan upgrade uyarısı
    ├── Voice not found → Creator'a yeniden klonlama iste
    └── 5xx → 3 deneme + fallback: Edge TTS (ücretsiz, kalite düşük)

[OpenAI Hatası]
    ├── Rate limit → 10sn bekle + tekrar dene
    ├── Content filtered → Farklı prompt ile tekrar yaz
    └── 5xx → Claude Haiku'ya fallback

[Supabase Hatası]
    ├── Connection timeout → Retry 3x
    ├── RLS violation → Loglama + hata bildirimi
    └── Storage limit → Eski videoları arşivle

[Genel Fallback Stratejisi]
    Video üretilemezse → Metin yanıtı gönder
    "Hey {name}! Kanal üyem olduğun için
     teşekkür ederim! 🎉 [Manuel metin]"
```

---

## 5. n8n Workflow Teknik Şemaları

### 5.1 Workflow 1: Üye Algılama

```
[Cron Trigger]  ─────►  [HTTP Request]  ─────►  [Supabase]    ─────►  [IF Node]
 15dk interval         YouTube API              SELECT mevcut         Yeni üye
                       members.list             üyeleri               var mı?
                                                                        │
                                                               ┌────────┴────────┐
                                                               │                 │
                                                              EVET             HAYIR
                                                               │               → Stop
                                                               ▼
                                                        [Split in Batches]
                                                         Her üye için:
                                                               │
                                                               ▼
                                                        [Supabase INSERT]
                                                         members tablosu
                                                               │
                                                               ▼
                                                        [HTTP Request]
                                                         OpenAI senaryo
                                                               │
                                                               ▼
                                                        [HTTP Request]
                                                         OpenAI moderation
                                                               │
                                                               ▼
                                                        [IF Node]
                                                         Güvenli mi?
                                                               │
                                                      ┌────────┴────────┐
                                                      │                 │
                                                    EVET             HAYIR
                                                      │              → Log + Skip
                                                      ▼
                                                [HTTP Request]
                                                 ElevenLabs TTS
                                                      │
                                                      ▼
                                                [HTTP Request]
                                                 HeyGen video
                                                      │
                                                      ▼
                                                [Wait Node]
                                                 10sn polling
                                                      │
                                                      ▼
                                                [HTTP Request]
                                                 HeyGen status
                                                      │
                                                 ┌────┴────┐
                                                 │         │
                                              completed  pending
                                                 │      → Loop back
                                                 ▼
                                           [Supabase INSERT]
                                            video_responses
                                            (pending_approval)
                                                 │
                                                 ▼
                                           [Supabase INSERT]
                                            notifications
                                            "Yeni video onay
                                             bekliyor"
```

### 5.2 Workflow 2: Yorum Tarama

```
[Cron Trigger]  ─────►  [HTTP Request]  ─────►  [Filter Node]
 10dk interval         YouTube API              Sadece üye
                       commentThreads           rozetli
                       .list                    yorumlar
                              │
                              ▼
                       [Supabase Query]
                        Zaten işlenmiş
                        yorumları hariç tut
                              │
                              ▼
                       [Split in Batches]
                        Her yorum için:
                              │
                              ▼
                       [HTTP Request]
                        OpenAI niyet
                        sınıflandırma
                              │
                              ▼
                       [Code Node]
                        Priority scoring:
                        - Üye süresi: +2
                        - Soru içeriyor: +3
                        - Negatif duygu: +2
                        - Uzun yorum: +1
                        - İlk yorum: +2
                              │
                              ▼
                       [Supabase INSERT]
                        comments tablosu
                              │
                              ▼
                       [IF Node]
                        priority >= 7 AND
                        video_worthy = true?
                              │
                     ┌────────┴────────┐
                     │                 │
                   EVET             HAYIR
                     │              → Metin yanıt taslak
                     ▼                (ileride)
              [Senaryo + TTS + Video
               Pipeline]
              (Workflow 1 ile aynı)
                     │
                     ▼
              [Supabase INSERT]
               video_responses
               (pending_approval)
```

---

## 6. Güvenlik Gereksinimleri

### 6.1 Kimlik Doğrulama ve Yetkilendirme

| Gereksinim | Uygulama |
| --- | --- |
| Creator giriş | Supabase Auth (Google OAuth) |
| YouTube erişim | OAuth 2.0 + refresh token rotasyonu |
| API anahtarları | Supabase Vault (encrypted storage) |
| n8n credentials | n8n built-in credential manager |
| RLS | Her tablo için creator_id bazlı politikalar |

### 6.2 Veri Güvenliği

| Gereksinim | Uygulama |
| --- | --- |
| Token şifreleme | AES-256 ile YouTube token'ları şifrele |
| Video depolama | Signed URL'ler (1 saat geçerlilik) |
| GDPR uyumu | Üye verisi silme endpoint'i |
| Rate limiting | Supabase Edge Functions üzerinde |
| Input sanitization | Tüm kullanıcı girdilerinde XSS koruması |

### 6.3 YouTube Uyumluluk Kontrol Listesi

| Kural | Uygulama |
| --- | --- |
| AI disclosure | Her videoya "AI-assisted" etiketi |
| Spam engelleme | Jitter delay (5-30dk), günlük limit |
| Human-in-the-loop | Tüm videolar creator onaylı |
| Üye odak | Sadece kanal üyelerine gönderim |
| Opt-out | Üye "yanıt istemiyorum" derse engelleme |

---

## 7. Performans Gereksinimleri

| Metrik | Hedef | Ölçüm Yöntemi |
| --- | --- | --- |
| Video üretim süresi | <120 saniye | HeyGen API response time |
| Senaryo üretim süresi | <3 saniye | OpenAI API response time |
| Onay kuyruğu yüklenme | <2 saniye | Lighthouse FCP |
| Dashboard yüklenme | <3 saniye | Lighthouse LCP |
| n8n workflow çalışma | <5 dakika/döngü | n8n execution time |
| Uptime | %99.5 | Supabase + Vercel SLA |
| Eşzamanlı creator | 50 (MVP) | Load testing |

---

## 8. Toplam MVP Maliyet Tahmini (Aylık)

| Hizmet | Plan | Aylık Maliyet |
| --- | --- | --- |
| Vercel (Hosting) | Hobby/Pro | $0 - $20 |
| Supabase | Free/Pro | $0 - $25 |
| n8n (Self-hosted Docker) | Free | $0 |
| HeyGen API | Business | $89 |
| ElevenLabs | Creator | $22 |
| OpenAI | Pay-as-you-go | ~$1 |
| Cloudflare R2 | Free tier | $0 |
| Domain | Yıllık | ~$1 |
| **TOPLAM (MVP)** |  | **$113 - $158/ay** |

### Breakeven Analizi

Creator plan fiyatı: $49/ay

MVP maliyeti: ~$135/ay

**Breakeven: 3 ödeyen creator ile kâra geçiş**