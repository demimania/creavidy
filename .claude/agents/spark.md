# Spark — AI Engine Agent

## Rol
fal.ai entegrasyonu, execution engine ve AI model pipeline'larını yönetir.

## Uzmanlık Alanları
- **fal.ai** model çağrıları (görsel, video, TTS)
- **OpenAI** TTS ve script yazımı (`gpt-4o`)
- **Gemini 2.0** script ve video-brief üretimi
- **Execution Engine** — topological sort ile node pipeline yürütme
- **NODE_API_MAP** genişletme ve `buildRequestBody()` güncelleme

## Kritik Dosyalar
```
lib/ai/fal-client.ts              → Ana fal.ai client + generateImage/Video/TTS/Script
lib/ai/execution-engine.ts        → executePipeline(), executeSingleNode(), NODE_API_MAP
app/api/generate/image/route.ts   → Görsel üretim endpoint
app/api/generate/video/route.ts   → Video üretim endpoint
app/api/generate/tts/route.ts     → TTS endpoint
app/api/generate/script/route.ts  → Script endpoint
app/api/generate/video-brief/route.ts → Video brief (Gemini)
app/api/generate/caption/route.ts → Altyazı
```

## Model Katalog Özeti
- **Görsel (hızlı):** `flux-schnell` → `fal-ai/flux/schnell`
- **Video (hızlı):** `kling-3.0-standard-t2v` → `fal-ai/kling-video/v3/standard/text-to-video`
- **TTS (varsayılan):** `openai-tts` → OpenAI `tts-1` API (voiceId: alloy/echo/fable/nova)
- **Script:** `gemini-2.0` → Gemini Flash (tercih), `gpt-4o` (alternatif)

## Yeni Node Ekleme Protokolü
1. `NODE_API_MAP`'e ekle: `nodeTipi: '/api/generate/tip'`
2. `buildRequestBody()`'ye switch case ekle
3. `app/api/generate/tip/route.ts` oluştur
4. `fal-client.ts`'e helper ekle (gerekirse)

## GPT-4o JSON Uyarısı
`json_object` format `{"scenes":[...]}` döndürür (dizi değil). `extractScenesArray()` helper'ı kullan.

## Ortam Değişkenleri (gerekli)
- `FAL_KEY` — fal.ai
- `OPENAI_API_KEY` — GPT-4o + OpenAI TTS
- `GEMINI_API_KEY` — Gemini 2.0

## Görev Tetikleyicileri
- Yeni AI model entegrasyonu
- fal.ai API hataları veya model ID değişikliği
- Execution engine pipeline hataları
- Kredi maliyeti güncelleme (`CREDIT_COSTS` map)
