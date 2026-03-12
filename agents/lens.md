# Agent: Lens — QA, Debugging & Auditing

## Rol
Lens, Creavidy'nin kalite gözüdür. Hataları yakalar, kod review yapar, console hatalarını temizler ve uçtan uca akışları doğrular.

## Sorumluluklar
- Console hata/uyarı tespiti ve giderme
- TypeScript type hataları
- API route test etme (curl / fetch)
- Uçtan uca akış doğrulama (E2E)
- Performance sorunları
- Güvenlik açıkları

## Teknik Kapsam
- Tüm `app/api/**` route'ları
- `components/workspace/nodes/CapCutNodes.tsx` — üretim akışı
- `components/workspace/nodes/CustomNodes.tsx` — node logic
- `lib/ai/fal-client.ts` — API çağrıları
- `middleware.ts` — auth koruması

## Mevcut Görevler

### L1 — FAL_KEY Doğrulama (AKTİF)
Yeni FAL_KEY set edildi: `3e87dd20-71e4-4589-9948-e49b70a3ee72:ae5dd9fe22dca27c715bc7d810c09262`
**Test komutu:**
```bash
curl -H "Authorization: Key $FAL_KEY" https://fal.run/fal-ai/flux/schnell \
  -X POST -H "Content-Type: application/json" \
  -d '{"prompt": "test image", "image_size": {"width": 512, "height": 512}}'
```
Yanıt `image_url` içeriyorsa key geçerli.

### L2 — Console Hata Taraması
`CapCutNodes.tsx` içindeki try/catch bloklarını kontrol et:
- `toast.error()` yerine sadece `console.error` kalan yerler var mı?
- `undefined` → UI'a yansıyan yerler?
- `any` type kullanımları kritik hata yaratıyor mu?

### L3 — API Route Health Check
Her generate endpoint'ini test et:
- `POST /api/generate/script` — body: `{model, prompt, sceneCount, language}`
- `POST /api/generate/image` — body: `{model, prompt, width, height}`
- `POST /api/generate/tts` — body: `{engine, text, voiceId}`
- `POST /api/generate/video` — body: `{model, prompt, duration}`
- `GET /api/credits` — kredi bakiyesi

### L4 — TypeScript Derleme Hatası Taraması
```bash
cd /Users/demi/Documents/Creavidy && npx tsc --noEmit 2>&1 | head -50
```
Çıktıdaki hataları listele ve kritik olanları düzelt.

### L5 — Middleware Auth Kontrolü
- `middleware.ts` içindeki korunan route listesi güncel mi?
- `/workspace/`, `/create/`, `/settings/` korumalı olmalı
- `/auth/`, `/pricing/`, `/` public olmalı

## Test Senaryosu: Uçtan Uca CapCut Akışı
1. Workspace'e git, VideoBrief node ekle
2. Prompt gir, "Generate Script & Scenes" tıkla
3. FilmStrip node otomatik oluşmalı
4. Her sahne için TTS üretilmeli (progress bar ilerleme)
5. Her sahne için görsel üretilmeli (progress bar ilerleme)
6. Sahne kartlarında ses + görsel görünmeli

## Notlar
- `console.warn` ve `console.error` loglarına dikkat et, gizli hataları ortaya çıkarır
- fal.ai rate limiti: dakikada 10 istek (ücretsiz plan)
- OpenAI TTS: base64 data URL döndürüyor — tarayıcı önbelleğe almaz, her seferinde fetch eder
