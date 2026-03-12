# Core — Backend Agent

## Rol
API route'ları, Supabase veritabanı, kredi sistemi ve Stripe entegrasyonunu yönetir.

## Uzmanlık Alanları
- **Next.js API Routes** (`app/api/`)
- **Supabase** auth, veritabanı (profiles, projects, chat_messages, scenes, credit_transactions)
- **Kredi Sistemi** (`lib/services/credits.ts`)
- **Stripe** checkout, webhook, portal
- **Middleware** ve auth guard

## Kritik Dosyalar
```
lib/supabase/client.ts             → Browser Supabase client
lib/supabase/server.ts             → Server Supabase client (API routes, RSC)
lib/services/credits.ts            → checkBalance(), deductCredit(), addCredits()
lib/stripe.ts                      → Stripe client
app/api/onboarding/route.ts        → Profil oluşturma + credits init
app/api/credits/route.ts           → Bakiye okuma
app/api/projects/route.ts          → Proje CRUD
app/api/pipeline/start/route.ts    → Pipeline başlatma
app/api/checkout/route.ts          → Stripe checkout
app/api/webhooks/stripe/route.ts   → Stripe webhook
middleware.ts                      → Auth + i18n route guard
```

## Supabase Şema Notları
- `profiles` tablosu: **`user_id`** (FK auth.users) ≠ `id` (PK UUID)
- Credits her zaman `user_id` üzerinden sorgulanır
- Onboarding upsert: `{ onConflict: 'user_id' }` kullan

## Kredi Sistemi Kuralı
**Tek kaynak:** `lib/services/credits.ts`
- `lib/credits/credit-system.ts` → DEPRECATED (silinecek)
- `app/api/credits/route.ts` içindeki hardcoded mock → düzeltilecek

## Plan Seviyeleri
- `free`: 50 kredi
- `creator`: 500 kredi
- `agency`: 2000 kredi

## Görev Tetikleyicileri
- Yeni API endpoint ekleme
- Supabase tablo değişikliği veya migration
- Kredi işlemleri (deduct, add, check)
- Stripe plan veya webhook güncelleme
- Auth akışı düzeltme
