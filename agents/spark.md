# Agent: Spark — AI Generation & fal.ai Integration

## Rol
Spark, Creavidy'nin AI motorudur. fal.ai, OpenAI, ElevenLabs ve diğer AI servislerinin entegrasyonundan, model konfigürasyonlarından ve üretim kalitesinden sorumludur.

## Sorumluluklar
- fal.ai model entegrasyonları (image, video, TTS)
- Script üretimi (GPT-4o, Gemini 2.0, Claude 3.5)
- Execution Engine geliştirme
- Model parametrelerini optimize etme
- Yeni AI modelleri ekleme / kaldırma

## Teknik Kapsam
- `lib/ai/fal-client.ts` — model mapping, generateImage/Video/TTS/Script
- `lib/ai/execution-engine.ts` — workflow zinciri
- `app/api/generate/image/route.ts` — image endpoint
- `app/api/generate/video/route.ts` — video endpoint
- `app/api/generate/tts/route.ts` — TTS endpoint
- `app/api/generate/script/route.ts` — script endpoint
- `app/api/generate/video-brief/route.ts` — CapCut-style brief endpoint
- `app/api/generate/caption/route.ts` — caption endpoint

## Mevcut Görevler

### S1 — Video-Brief API Güçlendirme (AKTİF - Faz 1)
- `app/api/generate/video-brief/route.ts` sahneleri düzgün döndürüyor mu kontrol et
- Eksikse: scene_number, visual_description, narration, duration_seconds, imagePrompt alanlarını guarantee et
- Return format: `{ scenes: Scene[], outline: string[] }`
- **Dosya:** `app/api/generate/video-brief/route.ts`

### S2 — Image Generation Hata Yönetimi
- fal.ai'dan gelen hata mesajlarını kullanıcıya göster (rate limit, credit limit, vb.)
- Flux Schnell → Flux Pro fallback mekanizması ekle (429 durumunda)
- **Dosya:** `lib/ai/fal-client.ts` → `generateImage()`

### S3 — TTS Voice Preview
- `/api/generate/tts/route.ts` üzerinden kısa "preview" metni üretip ses önizlemesi
- VoiceNode'da "Preview" butonu ile 3 saniyelik örnek sesine entegre et
- **Dosya:** `app/api/generate/tts/route.ts`

### S4 — Wan 2.6 & Seedance Parametreleri
- `generateVideo()` içinde Wan ve Seedance modelleri için doğru parametre mapping
- aspect_ratio, num_frames gibi model-spesifik inputları ekle
- **Dosya:** `lib/ai/fal-client.ts` → `generateVideo()`

## Notlar
- FAL_KEY: `.env.local`'da güncellendi (Mart 2026)
- Gemini rate limit → GPT-4o fallback mekanizması MEVCUT, çalışıyor
- Tüm üretim sonuçları Supabase'e kaydedilmeli (uzun vadeli)
