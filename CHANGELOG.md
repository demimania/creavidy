# Creavidy Changelog

## 2026-02-07

### Session Updates

#### Dashboard & Layout Refactor
- Created `app/[locale]/dashboard/layout.tsx` with persistent Sidebar
- Moved `Sidebar` to `components/dashboard/Sidebar.tsx`
- Refactored `DashboardPage` to use URL-based routing instead of tabs
- Extracted `OverviewTab` and `ChatTab` into separate components/pages
- Updated "Studio" navigation link to point to Main Dashboard

#### Navigation & Header Improvements
- Created new `components/ui/navbar.tsx` for Pricing and Storefront (fixed header with logo, links, language)
- Removed "Studio, Storefront, Pricing" links from `AppHeader` (specifically for Dashboard usage)
- Fixed `AppHeader` logo visibility logic (hidden in Dashboard where Sidebar exists)

#### Settings Page Refactor
- Moved Settings page to root layout (`/settings`), removing the main Dashboard sidebar
- Updated Settings sidebar content (UserInfo + Menu only, no Creavidy branding)
- Updated Sidebar link to point to `/settings`

#### Bug Fixes
- Added `no-store` cache policy to YouTube data fetch to prevent stale data after connection
- Added `components/ui/language-switcher.tsx` with 8 languages (EN, TR, ES, FR, DE, ZH, JA, PT)
- Added Language Switcher to Dashboard Header and Landing Page Navbar
- Fixed Navbar layout issues in Landing Page

#### Storefront & Pricing Updates
- Updated Storefront grid to uniform card sizes with hover animations
- Updated Pricing tiers: Free (7 Days), Creator ($99), Agency ($499)
- Removed "Back" buttons from dashboard sub-pages (Sidebar handles nav)

#### New Dashboard Sub-Pages
- Created `app/[locale]/dashboard/storefront/page.tsx` - Digital products showcase with BentoGrid
- Created `app/[locale]/dashboard/pricing/page.tsx` - Pricing plans with interactive cards
- Created `app/[locale]/dashboard/sales/page.tsx` - Sales analytics with Stripe placeholder
- Created `app/[locale]/dashboard/audience/page.tsx` - Audience insights with top fans list
- Created `app/[locale]/dashboard/settings/page.tsx` - Full settings page with sections

#### Navigation & Layout
- Updated `components/ui/app-header.tsx`: Added center navigation for Studio, Storefront, Pricing
- Implemented active state highlighting for navigation items
- Updated sidebar navigation to link to dedicated pages

#### Real YouTube API Integration
- Created `app/api/youtube/channel/route.ts` - Fetches real channel data from database
- Updated Dashboard to fetch real YouTube data via API
- Added Top Commenters/Fans section with real data
- Dynamic engagement rate calculation

#### Onboarding Flow Fix
- Changed redirect from `/dashboard/studio` to `/dashboard` after onboarding
- Dashboard now shows connected channel data immediately

#### UI/UX Improvements
- Created `components/ui/app-header.tsx` - Shared header with logo and back button
- Updated `app/[locale]/onboarding/page.tsx` - Added AppHeader component
- Updated `app/[locale]/dashboard/page.tsx` - Enhanced Overview with placeholder state
- Updated `app/[locale]/dashboard/studio/page.tsx` - Added AppHeader with avatar status

#### Dashboard Placeholder State (Fixed)
- Channel header now shows "Connect Your YouTube Channel" for new users
- Stats show 0 values until channel is connected
- Recent Videos shows empty state with "Connect YouTube" CTA
- Removed fake/mismatched mock data

#### Dashboard Enhancements
- Added YouTube channel header with subscriber count, views, video count
- Added Recent Videos section with thumbnails and stats
- Added Quick Actions panel linking to Studio
- Added Top Fans section with active commenters

#### Chatbot Fix
- Updated `lib/gemini.ts`: Changed model from `gemini-pro` to `gemini-1.5-flash`
- Added better error handling - returns user-friendly message instead of throwing
- Fixed embedding generation to return null on failure for graceful fallback

#### Real API Services (Replacing Mock)
- Updated `lib/services/heygen.ts` - Real HeyGen API with mock fallback
- Updated `lib/services/fishaudio.ts` - Real FishAudio API with mock fallback
- Created `lib/services/youtube.ts` - YouTube Data API for channel scraping

#### Virtual Avatar System (Completed Earlier)
- Created `app/api/avatar/upload/route.ts` - File upload to Supabase Storage
- Created `app/api/avatar/train/route.ts` - Avatar training trigger
- Created `app/api/avatar/status/route.ts` - Training status polling
- Created `app/api/avatar/generate/route.ts` - Content generation
- Updated `app/[locale]/onboarding/page.tsx` - 4-step onboarding flow
- Updated `app/[locale]/dashboard/studio/page.tsx` - Studio with video modal

#### Database
- Created `avatars` table with status enum
- Created `generated_content` table
- RLS disabled for development testing

---
*This file is auto-updated during development sessions.*
