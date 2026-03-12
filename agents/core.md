# Agent: Core — Backend, Database & Credits

## Rol
Core, Creavidy'nin altyapısıdır. Supabase, API route'ları, kredi sistemi, auth ve veri katmanından sorumludur.

## Sorumluluklar
- Supabase sorguları ve şema
- API route'ları (generate dışındakiler)
- Kredi sistemi (checkBalance, deductCredit, addCredits)
- Auth akışı (sign-in, sign-up, callback)
- Proje kaydetme/yükleme
- Middleware ve route koruması

## Teknik Kapsam
- `lib/services/credits.ts` — TEK kredi servisi
- `lib/supabase/client.ts` + `server.ts`
- `app/api/credits/route.ts` — kredi sorgulama
- `app/api/projects/` — proje CRUD
- `app/api/onboarding/route.ts` — kullanıcı onboarding
- `app/api/checkout/` — Stripe checkout (Faz 5)
- `middleware.ts` — route koruması
- `supabase/migrations/` — şema güncellemeleri

## Mevcut Görevler

### C1 — Credits Store Senkronizasyonu (AKTİF - Faz 0)
**Sorun:** `lib/stores/project-store.ts` satır 106'da `credits: 1250` hardcoded.
**Çözüm:** Workspace yüklendiğinde `/api/credits` endpoint'inden gerçek bakiyeyi çek ve store'u güncelle.
- `lib/stores/project-store.ts` içindeki `credits: 1250` değerini 0 yap
- `app/[locale]/workspace/[projectId]/page.tsx` içinde `useEffect` ile `/api/credits` çağır, `setCredits()` ile store'u doldur
- **Dosyalar:** `lib/stores/project-store.ts`, `app/[locale]/workspace/[projectId]/page.tsx`

### C2 — Pipelines Tablosu Kontrolü
- `supabase/migrations/add_pipelines_table.sql` var, uygulandı mı?
- `app/api/pipeline/start/route.ts` graceful fallback yapıyor ama tablo olmalı
- Migration'ı çalıştır veya Supabase dashboard'dan kontrol et

### C3 — Proje Kaydetme / Workspace Persist
- Workspace'teki node'lar (positions, configs) proje olarak kaydedilmeli
- `/api/projects/[id]` — PATCH ile node/edge durumunu kaydet
- Workspace yüklendiğinde `/api/projects/[id]` — GET ile geri yükle
- **Dosyalar:** `app/api/projects/[id]/route.ts`, `app/[locale]/workspace/[projectId]/page.tsx`

### C4 — Onboarding Sonrası Credits Seed
- Yeni kullanıcı onboarding tamamladığında 2000 kredi ver
- `app/api/onboarding/route.ts` içinde `addCredits(userId, 2000)` çağrısı olmalı
- **Dosya:** `app/api/onboarding/route.ts`

## Notlar
- `lib/credits/credit-system.ts` → MEVCUT DEĞİL (zaten silindi)
- `lib/services/credits.ts` → TEK geçerli kredi servisi
- UX-FIRST prensip: kredi yetersizse engelleme, sessiz devam
