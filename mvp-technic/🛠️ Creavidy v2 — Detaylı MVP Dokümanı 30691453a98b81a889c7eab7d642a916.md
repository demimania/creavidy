# 🛠️ Creavidy v2 — Detaylı MVP Dokümanı

> MVP Kapsamı: "YouTube Kanal Üyelerine AI Video Hoş Geldin + Üye Yorum Yanıt Sistemi"
> 

Süre: 8 Hafta 

Hedef: 5 beta creator, 500 üretilmiş video, ilk ödeme yapan müşteri

---

## 1. MVP Kapsam Tanımı (What's In / What's Out)

### MVP'de VAR ✅

- Creator onboarding (avatar + ses klonlama setup)
- YouTube kanal bağlama (OAuth)
- Yeni üye algılama (polling)
- Kişiselleştirilmiş hoş geldin videosu üretimi
- Üye yorumlarını algılama ve önceliklendirme
- AI video yanıt taslak üretimi
- Creator onay paneli (Tinder-style swipe UI)
- YouTube'a yorum + video link gönderme
- Temel analitik (kaç video gönderildi, kaçı onaylandı)

### MVP'de YOK ❌ (Sonraki fazlarda)

- Canlı AI sohbet (Members Lounge)
- Milestone kutlama videoları
- Çapraz platform (Instagram, TikTok)
- Gelişmiş Parasosyal CRM
- Kendi video motoru (MuseTalk self-hosted)
- Oyunlaştırma (leaderboard, puanlar)
- API erişimi
- White-label
- Mobil uygulama

---

## 2. Kullanıcı Hikayeleri (User Stories)

### Creator (Birincil Kullanıcı)

**US-01:** Creator olarak, YouTube kanalımı Creavidy'ye bağlamak istiyorum ki yeni üyelerimi otomatik algılayabileyim.

*Kabul Kriteri: OAuth ile YouTube kanal bağlantısı, kanal bilgileri çekilir*

**US-02:** Creator olarak, yüzümü ve sesimi bir kez kaydetmek istiyorum ki AI ikizim oluşsun.

*Kabul Kriteri: 2dk video yükleme/kaydetme, ses ve yüz modeli oluşturma (HeyGen API)*

**US-03:** Creator olarak, yeni üye olduğunda otomatik kişiselleştirilmiş hoş geldin videosu hazırlanmasını istiyorum.

*Kabul Kriteri: Üye adı + kanal bilgisi ile kişiselleştirilmiş senaryo ve video üretilir*

**US-04:** Creator olarak, üye yorumlarını görüp hangilerine video yanıt hazırlanacağına karar vermek istiyorum.

*Kabul Kriteri: Üye yorumları listelenip önceliklendirilir, AI taslak hazırlanır*

**US-05:** Creator olarak, hazırlanan video yanıtları hızlıca onaylamak/reddetmek istiyorum.

*Kabul Kriteri: Swipe arayüzü ile onay/red/düzenleme*

**US-06:** Creator olarak, onayladığım videoların YouTube'a otomatik gönderilmesini istiyorum.

*Kabul Kriteri: Video linki ile yorum yanıtı otomatik gönderilir*

### Kanal Üyesi (Son Kullanıcı)

**US-07:** Üye olarak, kanalın üyesi olduğumda creator'dan kişisel bir hoş geldin videosu almak istiyorum.

*Kabul Kriteri: Üyelik sonrası 24 saat içinde kişisel video alınır*

**US-08:** Üye olarak, yorumuma creator'dan video yanıt almak istiyorum.

*Kabul Kriteri: Yorum altına video linkli yanıt gelir*

---

## 3. Teknik Mimari (MVP)

### Teknoloji Stack'i

**Frontend:**

- Next.js 15 (App Router)
- Tailwind CSS + shadcn/ui
- Framer Motion (animasyonlar)
- Cursor ile geliştirme

**Backend / Otomasyon:**

- n8n (workflow otomasyonu - ana orkestratör)
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- Edge Functions (Supabase)

**AI Katmanı:**

- OpenAI GPT-4o-mini (senaryo üretimi)
- ElevenLabs API (ses klonlama + TTS)
- HeyGen API (video üretimi - MVP için)

**Entegrasyonlar:**

- YouTube Data API v3 (yorum okuma/yazma, kanal bilgileri)
- YouTube OAuth 2.0 (kimlik doğrulama)
- Cloudflare R2 / Supabase Storage (video depolama)

### Veritabanı Şeması (Supabase/PostgreSQL)

```
creators
├─ id (uuid, PK)
├─ email
├─ youtube_channel_id
├─ youtube_channel_name
├─ avatar_id (HeyGen avatar reference)
├─ voice_id (ElevenLabs voice reference)
├─ persona_prompt (creator'ın tonu ve stili)
├─ knowledge_base (JSON - SSS, ürünler, bağlantılar)
├─ plan (starter/creator/pro/agency)
├─ monthly_video_count
├─ monthly_video_limit
└─ created_at

members
├─ id (uuid, PK)
├─ creator_id (FK -> creators)
├─ youtube_channel_id (member'ın kanalı)
├─ youtube_display_name
├─ member_since
├─ tier_level (1/2/3)
├─ total_comments
├─ sentiment_score (0-100)
├─ last_interaction_at
├─ welcome_video_sent (boolean)
└─ created_at

comments
├─ id (uuid, PK)
├─ creator_id (FK)
├─ member_id (FK)
├─ youtube_comment_id
├─ youtube_video_id
├─ comment_text
├─ is_member_comment (boolean)
├─ intent_type (question/praise/complaint/lead)
├─ priority_score (1-10)
└─ created_at

video_responses
├─ id (uuid, PK)
├─ creator_id (FK)
├─ member_id (FK)
├─ comment_id (FK, nullable - hoş geldin için null)
├─ type (welcome/reply/milestone)
├─ script_text
├─ audio_url
├─ video_url
├─ status (draft/pending_approval/approved/sent/rejected)
├─ approved_at
├─ sent_at
├─ youtube_reply_id
└─ created_at
```

---

## 4. n8n Workflow Tanımları

### Workflow 1: Yeni Üye Algılama ve Hoş Geldin Videosu

**Tetikleyici:** Cron (Her 15 dakikada bir)

**Adımlar:**

1. **YouTube API Call:** Kanalın son activities/membership etkinliklerini çek
2. **Supabase Query:** Zaten tanınan üyeleri filtrele (yeni olanları bul)
3. **Supabase Insert:** Yeni üyeyi `members` tablosuna ekle
4. **GPT-4o-mini Call:** Hoş geldin senaryosu üret
    - Girdi: Üye adı, creator persona prompt, knowledge base
    - Çıktı: 5-10 saniyelik kişisel senaryo metni
5. **ElevenLabs Call:** Senaryoyu ses dosyasına çevir
6. **HeyGen API Call:** Avatar + ses ile video üret
7. **Supabase Insert:** Video kaydını `video_responses` tablosuna ekle (status: pending_approval)
8. **Webhook/Notification:** Creator'a bildirim gönder ("3 yeni hoş geldin videosu onayınızı bekliyor")

### Workflow 2: Üye Yorum Tarama ve Yanıt Hazırlama

**Tetikleyici:** Cron (Her 10 dakikada bir)

**Adımlar:**

1. **YouTube API Call:** `commentThreads.list` ile son yorumları çek
2. **Filter Node:** Sadece üye rozetli yorumları filtrele
3. **GPT-4o-mini Call #1:** Niyet sınıflandırma (soru/övgü/şikayet/spam)
4. **Priority Scoring:** Yorum önem puanı hesapla
    - Üye süresi (+puan), yorum uzunluğu (+puan), soru içeriyor (+puan), negatif duygu (+puan/acil)
5. **Supabase Insert:** Yorumları `comments` tablosuna kaydet
6. **Decision Node:** Puan > 7 ise video yanıt hazırla, değilse metin yanıt taslak hazırla
7. **GPT-4o-mini Call #2:** Yanıt senaryosu üret
    - Girdi: Yorum metni, üye profili, creator persona, knowledge base
8. **ElevenLabs + HeyGen:** Video üret (yüksek öncelik için)
9. **Supabase Insert:** Yanıt kaydını oluştur (status: pending_approval)

### Workflow 3: Onaylanan Videoların Gönderimi

**Tetikleyici:** Supabase Realtime (video_responses.status = 'approved' olduğunda)

**Adımlar:**

1. **Jitter Delay:** Rastgele 5-30 dakika bekle (bot algısı engelleme)
2. **Decision Node:** Video tipi kontrol
    - Welcome video → Community post veya yorum olarak gönder
    - Reply video → Yoruma yanıt olarak gönder
3. **YouTube API Call:** `comments.insert` ile yanıt gönder
    - İçerik: Metin yanıt + video linki
    - Örnek: "Sana özel bir video hazırladım! 🎬 [link]"
4. **Supabase Update:** Status -> 'sent', sent_at -> now()
5. **Analytics Log:** Gönderim kaydını tut

---

## 5. Ekranlar ve UI Akışı

### Ekran 1: Onboarding (3 Adım)

**Step 1 - YouTube Bağlantısı:**

- "Connect YouTube Channel" butonu
- OAuth akışı
- Başarılı bağlantı sonrası kanal adı, abone sayısı, üye sayısı görüntülenir

**Step 2 - Avatar Oluşturma:**

- Video kaydetme arayüzü (webcam)
- Veya video yükleme seçeneği
- HeyGen API ile avatar oluşturma
- Önizleme: "Bu sizin dijital ikiziniz" + 5sn demo video

**Step 3 - Persona Ayarları:**

- Ton seçimi: Esprili / Samimi / Profesyonel / Enerji Dolu
- Bilgi bankası yükleme: SSS, ürün bilgileri, yaygın sorular
- Test: "Test video üret" butonu ile ilk örnek video

### Ekran 2: Dashboard (Ana Ekran)

**Üst Kısım - Metrikler:**

- Bugün üretilen videolar / Limit
- Onay bekleyen videolar
- Bu ay gönderilen toplam video
- Üye memnuniyet skoru (ortalama)

**Sol Menü:**

- Dashboard
- Onay Kuyruğu (badge ile bekleyen sayısı)
- Üyeler
- Analitik
- Ayarlar

### Ekran 3: Onay Kuyruğu (Tinder UI)

**Kart Görünümü (Her video için):**

- Sol üst: Üye profil resmi + adı + "Üye: 3 aydır"
- Orta: Video önizleme oynatıcı
- Alt: Orijinal yorum metni
- Alt: AI'nın hazırladığı senaryo metni (düzenlenebilir)

**Aksiyonlar:**

- ⬅️ Sola kaydır = Reddet ("Bu yanlış, atla")
- ➡️ Sağa kaydır = Onayla ve gönder
- ✏️ Düzenle = Senaryoyu değiştir ve yeniden üret
- ⏩ Toplu Onayla = "Tümünü Onayla" butonu (güvenlik uyarısı ile)

### Ekran 4: Üye Profili

**Üst Kısım:**

- Üye adı, profil resmi, üyelik süresi
- Toplam yorum sayısı, gönderilen video sayısı
- Duygu skoru grafiği (son 30 gün)

**Alt Kısım:**

- Yorum geçmişi
- Gönderilen video yanıtları
- Manuel not alanı (creator'a özel)

---

## 6. API Entegrasyon Detayları

### YouTube Data API v3

**Kullanılacak Endpoint'ler:**

| Endpoint | Amaç | Kota Maliyeti |
| --- | --- | --- |
| `commentThreads.list` | Üye yorumlarını çekme | 1 ünite |
| `comments.insert` | Yorum yanıt gönderme | 50 ünite |
| `subscriptions.list` | Üyeleri listeleme | 1 ünite |
| `channels.list` | Kanal bilgileri | 1 ünite |

**Kota Stratejisi (Günlük 10.000 ünite):**

- Yorum okuma: ~200 sorgu x 1 = 200 ünite
- Yorum yazma: ~50 yanıt x 50 = 2.500 ünite
- Üye kontrol: ~20 sorgu x 1 = 20 ünite
- **Toplam: ~2.720 ünite/gün** (limit'in %27'si)

**Üye Algılama Yöntemi:**

YouTube'un doğrudan "yeni üye" webhook'u yok. Çözüm:

1. `commentThreads.list` ile yorumları çekerken yorum sahibinin üye olup olmadığını kontrol et
2. YouTube Studio'nun iç API'leri üzerinden üyelik bildirimlerini dinle (Community tab)
3. Alternatif: Creator'dan üyelik bildirimlerini Webhook ile Creavidy'ye yönlendirmesini iste

### HeyGen API (MVP Video Motor)

**Kullanılacak Endpoint'ler:**

- `POST /v2/video/generate` - Video üretimi
- `GET /v1/video_status.get` - Üretim durumu sorgulama
- `POST /v2/voices/clone` - Ses klonlama

**Maliyet Tahmini:**

- Creator plan: $48/ay (orta düzey)
- ~200 video/ay kapasitesi
- Dakika başı: ~$0.24

### ElevenLabs API

**Kullanılacak Endpoint'ler:**

- `POST /v1/text-to-speech/{voice_id}` - TTS
- `POST /v1/voices/add` - Ses klonlama

**Maliyet Tahmini:**

- Starter plan: $5/ay (30.000 karakter)
- Creator plan: $22/ay (100.000 karakter)
- ~500 video için yeterli

---

## 7. Geliştirme Takvimi (8 Hafta)

### Hafta 1-2: Altyapı ve Auth

- Supabase projesi kurulumu (DB, Auth, Storage)
- Next.js projesi scaffolding
- YouTube OAuth 2.0 entegrasyonu
- Temel creator profil sayfası
- **Teslimat:** Creator YouTube'unu bağlayabilir

### Hafta 3-4: AI Pipeline

- n8n kurulumu ve temel workflow'lar
- HeyGen API entegrasyonu (avatar oluşturma)
- ElevenLabs ses klonlama entegrasyonu
- GPT-4o-mini senaryo üretim prompt'ları
- İlk end-to-end test: İsim gir -> video çıktı al
- **Teslimat:** İsim girerek hoş geldin videosu üretilebilir

### Hafta 5-6: Otomasyon ve Dashboard

- YouTube yorum polling workflow'u
- Üye algılama lojiği
- Onay kuyruğu UI (Tinder-style)
- Video önizleme ve düzenleme
- YouTube'a yorum yazma entegrasyonu
- **Teslimat:** Tam döngü çalışır (yorum -> video -> onay -> gönderim)

### Hafta 7-8: Polish ve Beta Lansman

- Temel analitik dashboard
- Hata yönetimi ve fallback (video üretilemezse metin yanıt)
- Jitter delay implementasyonu
- AI disclosure etiketleri
- 5 beta creator davet et ve test et
- Landing page güncelleme
- **Teslimat:** Çalışan beta ürün, 5 aktif creator

---

## 8. Başarı Metrikleri (KPI)

### MVP Sonrası Hedefler (8. hafta sonu)

| Metrik | Hedef |
| --- | --- |
| Aktif beta creator | 5 |
| Üretilen video sayısı | 500+ |
| Video onay oranı | >80% |
| Ortalama video üretim süresi | <60 saniye |
| Creator memnuniyeti (NPS) | >8/10 |
| İlk ödeme yapan müşteri | 1+ |

### Takip Metrikleri (12. hafta sonu)

| Metrik | Hedef |
| --- | --- |
| Ödeme yapan creator | 10+ |
| Aylık tekrarlayan gelir (MRR) | $500+ |
| Üye retention artışı | >15% |
| Creator churn | <10%/ay |

---

## 9. Risk ve Azaltma Stratejileri

| Risk | Olasılık | Etki | Azaltma |
| --- | --- | --- | --- |
| YouTube API kota aşımı | Orta | Yüksek | Akıllı polling, önbellekleme, kota artma başvurusu |
| HeyGen API fiyat artışı | Düşük | Yüksek | Faz 2'de MuseTalk'a geçiş planı hazır |
| Video kalitesi yetersiz | Orta | Yüksek | Kısa format (5-15sn), ses kalitesine odaklanma |
| YouTube hesap yasaklama | Düşük | Kritik | Human-in-the-loop, jitter delay, disclosure |
| Creator'lar ürünü benimsemez | Orta | Yüksek | Erken validasyon, 5 dakika/gün vaat et |
| Uncanny valley etkisi | Orta | Orta | "Video sesli mesaj" olarak konumlandırma, beklenti yönetimi |

---

## 10. MVP Sonrası Yol Haritası

**Faz 2 (Hafta 9-16):** Milestone videoları, Parasosyal CRM v1, MuseTalk geçişi

**Faz 3 (Hafta 17-24):** Members Lounge (canlı AI sohbet), Oyunlaştırma

**Faz 4 (Hafta 25-36):** Çoklu platform, API erişimi, Agency özellikleri