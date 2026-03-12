# Creavidy: Kapsamlı Son Kullanıcı Deneyim ve Teknik Akış Dokümanı

Bu belge, Creavidy platformunun son kullanıcı (Creator/Agency) tarafındaki deneyimini, sistemin çalışma mantığını ve teknik süreçlerini en ince detayına kadar açıklar. Platform, basit bir video üretim aracı olmanın ötesinde, **"Yapay Zeka Destekli Topluluk Yönetim ve Büyütme Sistemi"** olarak kurgulanmiştir.

---

## 1. Platform Vizyonu ve Mimari
**Amaç:** İçerik üreticisinin "Zaman" sorununu çözmek ve takipçileriyle kurduğu "Bağ"ı (Engagement) yapay zeka ile ölçeklemek.
**Temel Prensip:** "Bir kez kaydet, sonsuza kadar üret. Bir kez kur, on binlerce kişiye kişisel cevap ver."

---

## 2. Detaylı Kullanıcı Yolculuğu (Step-by-Step Deep Dive)

### FAZ 1: Kurulum ve Dijital İkiz (Foundations)

Bu aşama, kullanıcının sisteme giriş yaptığı ve kendi yapay zeka kopyasını oluşturduğu temel aşamadır.

#### Adım 1.1: Kayıt ve Onboarding (Karşılama)
*   **Kullanıcı Arayüzü:** Modern, karanlık mod (Dark UI) bir landing page. "Start Free Trial" butonu.
*   **Aksiyon:** E-posta veya Google hesabı ile kayıt (`Next-Auth`).
*   **Sihirbaz (Wizard):** Kayıt sonrası kullanıcıyı 3 adımlı bir kurulum sihirbazı karşılar:
    1.  **Profil:** Ad, Soyad, Kanal Tipi (Eğitim, Eğlence, Vlog).
    2.  **Platform Bağlantısı:**
        *   "YouTube Kanalını Bağla" butonu (YouTube Data API v3 yetkisi istenir: `read_comments`, `manage_videos`).
        *   "Instagram Hesabını Bağla" butonu (Instagram Graph API yetkisi istenir: `manage_messages`, `read_comments`).
    3.  **Hedef Belirleme:** "Haftada kaç video üretmeyi planlıyorsun?" (Sistemi ona göre optimize eder).

#### Adım 1.2: Avatar Oluşturma (Fine-Tuning)
*   **Kullanıcı Arayüzü:** `Dashboard` > `Avatars` > `Create New`.
*   **Gereksinim:** Kullanıcıdan 2-3 dakikalık, iyi ışıkta çekilmiş, doğrudan kameraya baktığı bir video istenir.
*   **Teknik Süreç (Arka Plan):**
    1.  **Analiz:** Sistem videoyu kare kare işler (`HeyGen API` veya benzeri). Yüz hatlarını, mimikleri ve ağız hareketlerini haritalar.
    2.  **Ses Klonlama:** Videodaki ses ayrıştırılır (`ElevenLabs` veya `FishAudio`). Tonlama, vurgu ve konuşma hızı analiz edilerek bir "Ses Modeli" (Voiceprint) oluşturulur.
    3.  **Eğitim:** Yaklaşık 10-15 dakika içinde "Dijital İkiz" hazır hale gelir.
*   **Sonuç:** Kullanıcı artık hiç kamera karşısına geçmeden, sadece metin yazarak kendi görüntüsüyle konuşabilir.

---

### FAZ 2: İçerik Fabrikası (Production Engine)

Kullanıcının manuel video çekim yükünü ortadan kaldıran modüldür.

#### Adım 2.1: Studio (Video Üretim Merkezi)
*   **Kullanıcı Arayüzü:** `Dashboard` > `Studio`.
*   **Giriş Yöntemleri:**
    1.  **Metin (Script):** Kullanıcı senaryoyu yazar.
    2.  **Ses (Audio):** Kendi ses kaydını yükler, avatar dudak senkronu yapar.
    3.  **AI Writer:** "Bana 'Yapay Zeka Trendleri' hakkında 1 dakikalık viral bir metin yaz" der (`Gemini/OpenAI` entegrasyonu).
*   **Özelleştirme:**
    *   Video Formatı: 9:16 (Reels/TikTok/Shorts) veya 16:9 (YouTube).
    *   Arka Plan: Hazır şablonlar veya özel görsel yükleme.
    *   Avatar Konumu: Ekranın ortasında, köşesinde veya yuvarlak çerçeve içinde.

#### Adım 2.2: Render ve Çıktı
*   **İşlem:** "Generate Video" butonuna basılır.
*   **Süre:** 1 dakikalık video için ortalama 1-2 dakika render süresi.
*   **Çıktı:** 1080p veya 4K çözünürlükte, altyazılı (opsiyonel) hazır video dosyası.

---

### FAZ 3: Etkileşim Motoru (Engagement Engine / The Growth Core)

Platformun en güçlü ve rakiplerden ayıran kısmı burasıdır. Otomatik olarak topluluk yönetimi yapar.

#### Adım 3.1: Radar (Akıllı Dinleme ve Analiz)
*   **Tetikleyici:** Kullanıcı `Engagement` paneline girer veya sistem arka planda belirli aralıklarla (örn: her saat başı) tarama yapar.
*   **Sistem Ne Yapar?**
    *   Bağlı YouTube kanalındaki son 5 videoyu tarar.
    *   Yeni gelen yorumları çeker.
    *   **Duygu Analizi (Sentiment Analysis):** Yorumların "Pozitif", "Negatif" veya "Nötr" olduğunu belirler.
    *   **Soru Tespiti (Intent Detection):** Yorumun içinde bir soru olup olmadığını anlar (örn: "Bu kamerayı nereden aldın?", "Fiyatı ne kadar?").
*   **Filtreleme:** Spam yorumları, nefret söylemlerini ve kısa/anlamsız ("tşk", "ok" gibi) yorumları eler.
*   **Lider Tablosu (Leaderboard):** Kullanıcıya "Bu Hafta En Değerli 50 Takipçi" listesi sunar. (Kriter: Uzun yorum, soru sorma, sık etkileşim).

#### Adım 3.2: Toplu Kişiselleştirme (Bulk Personalization)
*   **Senaryo:** Kullanıcı, "Lider Tablosu"ndaki ilk 20 kişiye teşekkür etmek istiyor.
*   **Aksiyon:** 20 kişiyi seçer ve "Reply with Video" (Video ile Yanıtla) der.
*   **Şablon Hazırlama:** Tek bir genel mesaj yazar:
    > "Harika yorumun ve desteğin için çok teşekkürler! Sorunu bir sonraki videoda detaylı cevaplayacağım, takipte kal!"
*   **Variable (Değişken) Kullanımı:** Mesajın içine `{Name}` değişkeni eklenir.
*   **Sihirli Dokunuş:** Sistem, 20 farklı videoyu render ederken, avatar her videoda **seçilen kişinin ismini sesli olarak söyler**.
    *   Video 1: "Merhaba **Ahmet**, harika yorumun..."
    *   Video 2: "Selam **Zeynep**, harika yorumun..."

#### Adım 3.3: Dağıtım ve Insta-Bridge (Dağıtım Köprüsü)
Burada amaç, YouTube trafiğini Instagram'a taşımak ve daha sıkı bir bağ kurmaktır.

*   **YouTube Tarafı (Otomatik Yanıt):**
    *   Sistem, YouTube'daki ilgili yorumun altına otomatik metin yanıtı atar:
    *   > "@KullanıcıAdı, bu harika sorun için sana özel bir video çektim! Instagram'dan bana **'CEVAP123'** kodunu mesaj at, videoyu sana göndereyim."
*   **Instagram Tarafı (Webhook Dinleyici):**
    *   Creavidy'nin Instagram modülü, gelen DM kutusunu dinler.
    *   Bir kullanıcı "CEVAP123" yazdığında, sistem veritabanından o kullanıcı için üretilmiş özel videoyu bulur.
    *   Videoyu (veya izleme linkini) otomatik olarak DM üzerinden gönderir.
*   **Sonuç:** Kullanıcı (Takipçi), sevdiği Youtuber'dan **kişisel bir video mesajı** almıştır. Bağlılık (Loyalty) tavan yapar.

---

## 3. Kullanıcı Senaryosu (Use Case: YouTuber Efe)

1.  **Sabah 09:00:** Efe uyanır, Creavidy Dashboard'unu açar.
2.  **09:05:** "Engagement" sekmesine bakar. Dün yüklediği videoya 500 yorum gelmiştir. Sistem, aralarından "En iyi 10 soru"yu seçip önüne getirmiştir.
3.  **09:10:** Efe, bu 10 kişiye cevap vermek ister ama kamera kurmaya üşenir. "Reply All" der.
4.  **09:12:** Genel bir cevap metni yazar: *"Sorun çok güzel, bunu detaylı bir videoda anlatacağım {Name}, beklemede kal!"*
5.  **09:15:** Kahvesini alırken Creavidy arka planda 10 videoyu üretir.
6.  **09:20:** Videolar hazırdır. Sistem otomatik olarak YouTube yorumlarına yanıt yazar: *"Sana özel cevap hazırladım, Instagram'dan 'CEVAP' yaz gönder."*
7.  **Gün Boyu:** O 10 takipçi (ve yorumları gören diğerleri) Instagram'a hücum eder, DM atar. Efe'nin Instagram DM kutusu, Creavidy sayesinde otomatik olarak onlara video gönderir.
8.  **Sonuç:** Efe 15 dakikada, normalde 3 saat sürecek bir etkileşimi yönetmiş ve Instagram hesabını büyütmüştür.

---

## 4. Teknik Altyapı ve Modüller

Sistemin arkasında çalışan görünmez çarklar:

| Modül | Görevi | Kullanılan Teknoloji / API |
| :--- | :--- | :--- |
| **Auth Service** | Güvenli giriş ve API Token yönetimi. | Next-Auth, OAuth 2.0 |
| **Media Processor** | Video/Ses işleme ve render kuyruğu. | FFmpeg, GPU Cloud (AWS/Google) |
| **NLP Engine** | Yorumları anlama, duygu analizi, spam filtresi. | OpenAI GPT-4 veya Gemini Pro |
| **Social Graph** | Hangi kullanıcının hangi platformda olduğunu eşleştirme. | Supabase (PostgreSQL) |
| **Webhook Manager**| Platformlardan gelen anlık bildirimleri (yeni yorum, yeni DM) dinleme. | Stripe Webhooks, Meta Webhooks |
| **Notification Svc**| İşlemler bitince kullanıcıya e-posta/SMS atma. | Resend / Twilio |

---

## 5. Rakiplerden Farkı (Competitive Advantage Matrix)

| Özellik | Geleneksel AI Araçları (HeyGen, D-ID) | Creavidy |
| :--- | :--- | :--- |
| **Fokus** | Sadece Video Üretimi | **Video + Topluluk Büyütme** |
| **İş Akışı** | Manuel (Tek tek video yap) | **Otomatik (Toplu Yanıt Sistemi)** |
| **Veri Kullanımı**| Yok (Kullanıcı ne girerse o) | **Akıllı (Yorumları okur, analiz eder)** |
| **Platform** | Tek yönlü (Sadece çıktı verir) | **Çok Yönlü (Platformlar arası köprü kurar)** |
| **Hedef Kitle** | Kurumsal, Eğitim | **İçerik Üreticileri (Creators), Ajanslar** |

Bu detaylı akış, projenin sadece bir "Video Aracı" olmadığını, bir **"Creator Growth OS" (İçerik Üretici Büyüme İşletim Sistemi)** olduğunu net bir şekilde ortaya koymaktadır.
