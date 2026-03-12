# CREAVIDY - Uygulama Geliştirme Task Listesi

**Proje:** Creavidy (Project Echo)
**Vizyon:** YouTube İçerik Üreticileri için AI Tabanlı Dijital İkiz + Link-in-Bio + E-Ticaret Platformu
**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, Stripe Connect, HeyGen API, ElevenLabs API, YouTube Data API v3

---

## FAZ 0: Proje Kurulumu ve Altyapı

- [ ] **0.1** Next.js 14 projesi oluştur (App Router + TypeScript)
- [ ] **0.2** Tailwind CSS, Shadcn UI, Framer Motion, Lucide React kurulumu
- [ ] **0.3** Global tema ayarları (Neo-Creator: `#0F051D` zemin + `#D1FE17` neon yeşil vurgu, Dark Mode)
- [ ] **0.4** Klasör yapısını oluştur (`app/`, `components/`, `lib/`, `types/`, `hooks/`, `utils/`)
- [ ] **0.5** Ortam değişkenleri şablonunu hazırla (`.env.local` + `.env.example`)
- [ ] **0.6** Supabase projesi oluştur ve bağlantıyı kur
- [ ] **0.7** ESLint, Prettier ve Husky konfigürasyonu
- [ ] **0.8** PWA (Progressive Web App) konfigürasyonu (manifest.json, service worker)

---

## FAZ 1: Veritabanı Şeması (Supabase / PostgreSQL)

- [ ] **1.1** `profiles` tablosu (id, email, username, full_name, avatar_url, bio, youtube_channel_id, heygen_avatar_id, elevenlabs_voice_id, subscription_plan, credits_balance, theme_config, stripe_account_id)
- [ ] **1.2** `products` tablosu (id, user_id, title, description, price, type [ai_video, digital, booking, course], file_url, ai_prompt_template, cover_image, is_active, sort_order)
- [ ] **1.3** `orders` tablosu (id, product_id, seller_id, buyer_email, buyer_name, prompt_text, amount, platform_fee, status [pending, processing, generating, completed, refunded], video_url, language, created_at)
- [ ] **1.4** `avatars` tablosu (id, user_id, heygen_avatar_id, elevenlabs_voice_id, training_video_url, is_active, languages)
- [ ] **1.5** `wallets` tablosu (id, user_id, total_earned, pending_balance, available_balance, currency)
- [ ] **1.6** `credit_transactions` tablosu (id, user_id, type [usage, purchase, bonus], amount_minutes, description, order_id)
- [ ] **1.7** Row Level Security (RLS) politikalarını tanımla
- [ ] **1.8** Veritabanı fonksiyonları ve triggerları oluştur

---

## FAZ 2: Kimlik Doğrulama (Authentication)

- [ ] **2.1** Supabase Auth konfigürasyonu
- [ ] **2.2** "Google ile Giriş Yap" (OAuth 2.0) entegrasyonu
- [ ] **2.3** YouTube kanal bağlama akışı (OAuth scope ile YouTube Data API erişimi)
- [ ] **2.4** Kayıt sayfası tasarımı ve geliştirmesi (`/signup`)
- [ ] **2.5** Giriş sayfası tasarımı ve geliştirmesi (`/login`)
- [ ] **2.6** Onboarding akışı - Kullanıcı adı (mağaza URL'i) seçimi (`creavidy.com/[username]`)
- [ ] **2.7** Auth middleware (korumalı rotalar için)
- [ ] **2.8** Oturum yönetimi ve token yenileme

---

## FAZ 3: YouTube Entegrasyonu

- [ ] **3.1** YouTube Data API v3 client oluştur
- [ ] **3.2** Kanal bilgilerini otomatik çekme (profil fotoğrafı, kanal kapağı, açıklama)
- [ ] **3.3** Canlı Abone Sayacı bileşeni (gerçek zamanlı güncelleme)
- [ ] **3.4** Son yüklenen video bileşeni (auto-embed, blurry background)
- [ ] **3.5** YouTube verilerini önbelleğe alma ve periyodik güncelleme

---

## FAZ 4: Public Storefront (Mağaza Vitrini)

- [ ] **4.1** Dinamik rota oluştur (`/[username]/page.tsx`)
- [ ] **4.2** Hero Section - Son YouTube videosu arka planı (sessiz, bulanık) + Profil bilgileri + Canlı Abone Sayacı
- [ ] **4.3** Call-to-Action butonu ("Creator ile Konuş (AI)" - Pulse animasyonlu)
- [ ] **4.4** Ürün Grid/Listesi - Glowing Neon kartları (Magic MCP tarzı)
- [ ] **4.5** Ürün detay görünümü (her tip için: AI Video, Dijital Ürün, Randevu, Kurs)
- [ ] **4.6** Purchase Drawer (alttan açılan satın alma paneli) - İsim, mesaj, karakter limiti
- [ ] **4.7** Sipariş özet ekranı (fiyat + tahmini teslim süresi)
- [ ] **4.8** Başarılı sipariş ekranı (konfeti animasyonu + onay mesajı)
- [ ] **4.9** Mobil öncelikli responsive tasarım (Instagram Stories tarzı dikey akış)
- [ ] **4.10** SEO ve Open Graph meta etiketleri (paylaşım önizlemesi)
- [ ] **4.11** "Powered by Creavidy" filigranı (Starter paket için)

---

## FAZ 5: Creator Dashboard (Yönetim Paneli)

### 5A: Dashboard Layout ve Navigasyon
- [ ] **5A.1** Dashboard layout (`/dashboard/layout.tsx`) - Sidebar navigasyon
- [ ] **5A.2** Korumalı rota yapısı (auth kontrolü)
- [ ] **5A.3** Mobil uyumlu sidebar (hamburger menü)

### 5B: Genel Bakış (Overview)
- [ ] **5B.1** Cüzdan kartı (Kazanılan / Bekleyen / Çekilebilir bakiye)
- [ ] **5B.2** AI Kredi göstergesi (Kalan dakika)
- [ ] **5B.3** Anlık istatistikler (bugünkü satış, sipariş sayısı)
- [ ] **5B.4** Analytics - Ülke bazlı sipariş haritası
- [ ] **5B.5** Son siparişler listesi (bildirim akışı)

### 5C: Sipariş Yönetimi (Orders)
- [ ] **5C.1** Inbox mantığında sipariş listesi
- [ ] **5C.2** Filtreler (Ticari / Hediye / Tamamlandı / İşlemde)
- [ ] **5C.3** Sipariş detay görünümü (müşteri bilgisi, mesaj, durum)
- [ ] **5C.4** Manuel yanıtlama akışı (metin gir → önizle → gönder)
- [ ] **5C.5** Sipariş durumu güncelleme ve takip

### 5D: Ürün Yönetimi (Products)
- [ ] **5D.1** Ürün listeleme sayfası
- [ ] **5D.2** Yeni ürün ekleme formu (tip seçimi: AI Video, Dijital, Randevu, Kurs)
- [ ] **5D.3** Ürün düzenleme formu
- [ ] **5D.4** Dijital dosya yükleme (Supabase Storage)
- [ ] **5D.5** Fiyat ve indirim tanımlama
- [ ] **5D.6** Sürükle-bırak ürün sıralama
- [ ] **5D.7** Ürün aktif/pasif durumu kontrolü

### 5E: AI Studio
- [ ] **5E.1** Avatar oluşturma akışı (2 dk video yükleme → HeyGen işleme)
- [ ] **5E.2** Ses klonlama akışı (3 paragraf okuma → ElevenLabs eğitimi)
- [ ] **5E.3** Demo video önizleme (10 sn doğrulama videosu)
- [ ] **5E.4** Avatar güncelleme ve yönetim
- [ ] **5E.5** Desteklenen diller listesi ve yeni dil ekleme
- [ ] **5E.6** Avatar durum göstergesi (eğitiliyor / hazır / hata)

### 5F: Mağaza Düzenleme (Store Editor)
- [ ] **5F.1** Profil düzenleme (fotoğraf, isim, bio)
- [ ] **5F.2** Tema özelleştirme (renk seçimi)
- [ ] **5F.3** Mağaza önizleme

### 5G: Ayarlar (Settings)
- [ ] **5G.1** Abonelik yönetimi (paket değiştirme / yükseltme)
- [ ] **5G.2** Stripe hesap bağlantısı ve yönetimi
- [ ] **5G.3** Bildirim tercihleri
- [ ] **5G.4** Hesap silme / dondurma

---

## FAZ 6: Ödeme Sistemi (Stripe Connect)

- [ ] **6.1** Stripe Connect (Express) entegrasyonu
- [ ] **6.2** Creator onboarding - Stripe hesap bağlama akışı
- [ ] **6.3** Checkout Session oluşturma (Apple Pay, Google Pay, Kredi Kartı desteği)
- [ ] **6.4** Split Payments - Otomatik komisyon kesintisi (Platform %10-20, Creator %80-90)
- [ ] **6.5** Stripe Webhook handler (`/api/webhooks/stripe`)
- [ ] **6.6** Ödeme başarılı → Sipariş durumu güncelleme
- [ ] **6.7** İade (refund) akışı
- [ ] **6.8** Creator payout (bakiye çekme) sistemi
- [ ] **6.9** Fatura ve makbuz oluşturma

---

## FAZ 7: AI Video Üretim Motoru (The Brain)

### 7A: İçerik Moderasyonu
- [ ] **7A.1** OpenAI Moderation API entegrasyonu
- [ ] **7A.2** Gelen metin tarama (küfür, hakaret, nefret söylemi, cinsel içerik, politik içerik)
- [ ] **7A.3** Otomatik red ve iade akışı (uygunsuz içerik tespit edildiğinde)

### 7B: Video Üretim Pipeline
- [ ] **7B.1** ElevenLabs API client - Ses sentezi (metin → ses dosyası)
- [ ] **7B.2** ElevenLabs çoklu dil desteği (Türkçe konuş → İngilizce/Almanca/Portekizce yanıt)
- [ ] **7B.3** HeyGen API client - Video üretimi (ses + avatar → video)
- [ ] **7B.4** HeyGen Webhook handler (video hazır bildirimi)
- [ ] **7B.5** Video üretim kuyruğu (queue) sistemi
- [ ] **7B.6** Video depolama (Supabase Storage veya CDN)
- [ ] **7B.7** "Bu bir AI Video Yanıtıdır" yasal uyarı filigranı

### 7C: Teslimat Sistemi
- [ ] **7C.1** E-posta bildirim sistemi (sipariş alındı, video hazır)
- [ ] **7C.2** Video izleme sayfası (özel URL ile güvenli erişim)
- [ ] **7C.3** SMS bildirim entegrasyonu (opsiyonel)

---

## FAZ 8: Dijital Ürün Teslimatı

- [ ] **8.1** Güvenli dosya yükleme (Supabase Storage - imzalı URL)
- [ ] **8.2** Satın alma sonrası otomatik indirme linki oluşturma
- [ ] **8.3** E-posta ile dijital ürün teslimatı (PDF, video, e-kitap)
- [ ] **8.4** İndirme limiti ve süre kısıtlaması

---

## FAZ 9: Kredi ve Abonelik Sistemi

- [ ] **9.1** Paket yapısı implementasyonu (Starter ücretsiz / Pro $89 / Agency $489)
- [ ] **9.2** Aylık dahil dakika takibi (Pro: 15 dk, Agency: 120 dk)
- [ ] **9.3** Kredi satın alma akışı (dakika bittiğinde ekstra kredi)
- [ ] **9.4** Otomatik maliyet hesaplama (komisyon + AI maliyet kesintisi)
- [ ] **9.5** Video süresi limitleri (Starter: 30 sn, Pro: 5 dk, Agency: 15 dk)
- [ ] **9.6** Stripe Billing entegrasyonu (aylık otomatik ödeme)

---

## FAZ 10: Animasyonlar ve UI Polish

- [ ] **10.1** Shader Animation arka plan (akışkan mor-yeşil dalgalar)
- [ ] **10.2** Glowing Neon kart efektleri (Framer Motion)
- [ ] **10.3** Text Reveal animasyonu (scroll tetiklemeli)
- [ ] **10.4** Pulse animasyonlu CTA butonları
- [ ] **10.5** Konfeti animasyonu (başarılı sipariş)
- [ ] **10.6** Sayfa geçiş animasyonları
- [ ] **10.7** Skeleton loading ekranları

---

## FAZ 11: Bildirimler ve İletişim

- [ ] **11.1** E-posta şablonları tasarımı (hoş geldin, sipariş, video hazır)
- [ ] **11.2** Transactional e-posta servisi entegrasyonu (Resend veya SendGrid)
- [ ] **11.3** Push notification altyapısı (PWA)
- [ ] **11.4** In-app bildirim sistemi (dashboard içi)

---

## FAZ 12: Güvenlik ve Performans

- [ ] **12.1** Rate limiting (API istekleri için)
- [ ] **12.2** Input validation ve sanitization
- [ ] **12.3** CORS politikaları
- [ ] **12.4** Resim optimizasyonu (Next.js Image)
- [ ] **12.5** Lazy loading ve code splitting
- [ ] **12.6** Supabase Edge Functions optimizasyonu
- [ ] **12.7** Error boundary ve hata yönetimi
- [ ] **12.8** Loglama ve monitoring altyapısı

---

## FAZ 13: Test ve Kalite Kontrol

- [ ] **13.1** Onboarding akışı manuel test (kayıt → username → Stripe bağlama)
- [ ] **13.2** Ürün CRUD testi (ekleme, düzenleme, silme, sıralama)
- [ ] **13.3** Storefront testi (mobil + desktop görünüm)
- [ ] **13.4** Ödeme akışı testi (Stripe test modu)
- [ ] **13.5** AI Video üretim testi (HeyGen + ElevenLabs)
- [ ] **13.6** Dijital ürün teslimat testi
- [ ] **13.7** Responsive tasarım testi (çeşitli ekran boyutları)
- [ ] **13.8** Performans testi (Lighthouse skoru hedef: 90+)

---

## FAZ 14: Deploy ve Canlıya Alma

- [ ] **14.1** Vercel deploy konfigürasyonu
- [ ] **14.2** Domain ayarları (creavidy.com)
- [ ] **14.3** SSL sertifikası
- [ ] **14.4** Üretim ortamı environment variables
- [ ] **14.5** Stripe live moda geçiş
- [ ] **14.6** Supabase üretim ortamı ayarları
- [ ] **14.7** Analytics entegrasyonu (Google Analytics / Plausible)
- [ ] **14.8** Error tracking (Sentry)

---

## ÖZET İSTATİSTİKLER

| Metrik | Değer |
|--------|-------|
| **Toplam Faz** | 15 (0-14) |
| **Toplam Task** | 107 |
| **Kritik Entegrasyonlar** | 6 (Supabase, Stripe, YouTube, HeyGen, ElevenLabs, OpenAI) |
| **Hedef MVP Süresi** | 45 gün |
| **Öncelik Sırası** | Faz 0 → 1 → 2 → 4 → 5 → 6 → 3 → 7 → 8 → 9 → 10-14 |

---

*Son güncelleme: 05 Şubat 2026*
*Hazırlayan: Claude AI*
