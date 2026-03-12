-- ============================================================================
-- PROFILES TABLE
-- Creators'ın temel bilgileri ve AI avatar konfigürasyonları
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Temel Bilgiler
  email VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- YouTube Integration
  youtube_channel_id VARCHAR(255) UNIQUE,
  youtube_channel_name VARCHAR(255),
  youtube_subscriber_count INTEGER DEFAULT 0,
  youtube_profile_image TEXT,
  youtube_last_sync TIMESTAMP,

  -- AI Avatar Configuration
  heygen_avatar_id VARCHAR(255),
  heygen_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, active, failed
  elevenlabs_voice_id VARCHAR(255),
  elevenlabs_status VARCHAR(20) DEFAULT 'pending',
  training_video_url TEXT,
  training_video_uploaded_at TIMESTAMP,

  -- Subscription & Payment
  subscription_plan VARCHAR(20) DEFAULT 'starter', -- starter, pro, agency
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  stripe_account_id VARCHAR(255),
  stripe_status VARCHAR(20) DEFAULT 'pending',

  -- AI Credits & Usage
  monthly_video_minutes INTEGER DEFAULT 0, -- Plan-based limit
  used_video_minutes INTEGER DEFAULT 0,
  credits_balance DECIMAL(10, 2) DEFAULT 0.00,

  -- Preferences
  theme_config JSONB DEFAULT '{"dark": true, "accentColor": "#D1FE17"}',
  language VARCHAR(10) DEFAULT 'tr',
  supported_languages TEXT[] DEFAULT ARRAY['tr'],

  -- Account Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_onboarded BOOLEAN DEFAULT false,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_youtube_channel_id ON profiles(youtube_channel_id);
CREATE INDEX idx_profiles_subscription_plan ON profiles(subscription_plan);

-- RLS Policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Public can view basic profile info by username"
  ON profiles FOR SELECT
  USING (true); -- We might want to restrict columns later, but for now public read on profiles is needed for store pages

-- ============================================================================
-- PRODUCTS TABLE
-- Creators'ın satmak istediği hizmetler/ürünler
-- ============================================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  -- Temel Bilgiler
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- ai_video, digital, physical_link, booking, course
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- AI Video Özellikleri
  ai_prompt_template TEXT, -- Varsayılan prompt, müşteri düzenleme yapabilir
  max_video_duration INTEGER DEFAULT 300, -- seconds
  video_language VARCHAR(10) DEFAULT 'tr',

  -- Dijital Ürün / Dosya
  file_url TEXT, -- S3/Supabase Storage URL
  file_type VARCHAR(20), -- pdf, zip, video, etc.
  file_size_mb DECIMAL(8, 2),

  -- Fiziksel Ürün Link Bilgileri
  external_url TEXT, -- Harici satış sitesi URL'i (Amazon, Trendyol, kendi site vb.)
  affiliate_tracking_id VARCHAR(255), -- Affiliate tracking kodu
  redirect_type VARCHAR(20) DEFAULT 'direct', -- direct, affiliate, tracked
  click_count INTEGER DEFAULT 0, -- Toplam tıklanma sayısı
  commission_type VARCHAR(20) DEFAULT 'percentage', -- percentage, fixed
  commission_value DECIMAL(10, 2), -- Komisyon değeri (% veya sabit tutar)

  -- Görüntü
  cover_image TEXT,

  -- Durum
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  -- İstatistikler
  total_purchases INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0.00,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_type ON products(type);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view active products from any creator"
  ON products FOR SELECT
  USING (is_active = true);
CREATE POLICY "Users can manage their own products"
  ON products FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- ORDERS TABLE
-- Her bir fan satın alımı / video generation request
-- ============================================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  -- Buyer Information (Anonim olabilir)
  buyer_email VARCHAR(255) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(20),
  buyer_country_code VARCHAR(2),

  -- Order Content
  prompt_text TEXT, -- Fan'ın soru/request'i
  response_language VARCHAR(10) DEFAULT 'tr',
  custom_instructions TEXT,

  -- Payment Information
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  platform_fee DECIMAL(10, 2) NOT NULL, -- Creavidy's commission
  stripe_payment_intent_id VARCHAR(255),

  -- Video Generation
  status VARCHAR(20) DEFAULT 'pending',
    -- pending, payment_confirmed, moderation_pending, processing, generating,
    -- ready, delivered, completed, refunded, failed

  video_url TEXT, -- Generated video URL
  video_generated_at TIMESTAMP,
  video_duration_seconds INTEGER,
  video_thumbnail_url TEXT,

  -- Delivery
  delivery_method VARCHAR(20) DEFAULT 'email', -- email, sms, both
  delivered_at TIMESTAMP,

  -- Refund
  refund_reason VARCHAR(255),
  refunded_at TIMESTAMP,
  refund_amount DECIMAL(10, 2),

  -- Analytics
  ai_model_used VARCHAR(50) DEFAULT 'heygen_v2',
  generation_cost_cents INTEGER, -- HeyGen + ElevenLabs cost in cents
  processing_time_seconds INTEGER,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_buyer_email ON orders(buyer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = seller_id);
-- For buyers, since they are anonymous mostly, we depend on backend logic or secure tokens to view orders. 
-- Or if logged in as buyer (future feature), we add policy here.

-- ============================================================================
-- AVATARS TABLE
-- Creator'ın özel avatar versiyonları (multi-avatar support)
-- ============================================================================
CREATE TABLE avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  -- Avatar Bilgileri
  name VARCHAR(255) NOT NULL,
  description TEXT,
  heygen_avatar_id VARCHAR(255),
  elevenlabs_voice_id VARCHAR(255),

  -- Training Data
  training_video_url TEXT,
  training_uploaded_at TIMESTAMP,

  -- Status
  status VARCHAR(20) DEFAULT 'training', -- training, active, archived
  is_default BOOLEAN DEFAULT false,

  -- Supported Languages
  supported_languages TEXT[] DEFAULT ARRAY['tr'],

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_avatars_user_id ON avatars(user_id);

ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own avatars"
  ON avatars FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- WALLETS TABLE
-- Creator'ın kazanç takibi ve para transferi
-- ============================================================================
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  -- Balance Information
  total_earned DECIMAL(15, 2) DEFAULT 0.00,
  pending_balance DECIMAL(15, 2) DEFAULT 0.00, -- 7 gün bekleme süresi
  available_balance DECIMAL(15, 2) DEFAULT 0.00, -- Çekilebilir

  -- Withdraw History
  total_withdrawn DECIMAL(15, 2) DEFAULT 0.00,
  last_withdrawal_at TIMESTAMP,

  -- Currency & Bank
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_connect_account_id VARCHAR(255),

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wallet"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- CREDIT_TRANSACTIONS TABLE
-- Her bir credit işlemi (usage, purchase, bonus)
-- ============================================================================
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  -- Transaction Type
  type VARCHAR(20) NOT NULL, -- usage, purchase, bonus, refund
  amount_minutes DECIMAL(10, 2) NOT NULL,
  amount_usd DECIMAL(10, 2),

  -- Reference
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  description TEXT,

  -- Balance After Transaction
  balance_after DECIMAL(10, 2),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- YOUTUBE DATA TABLES (For Digital Twin Training)
-- ============================================================================

CREATE TABLE youtube_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Link to creator profile
    channel_id VARCHAR(255) UNIQUE NOT NULL, -- YouTube ID (e.g., UCxxxxx)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    subscriber_count BIGINT,
    video_count BIGINT,
    view_count BIGINT,
    custom_url VARCHAR(255),
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE youtube_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES youtube_channels(id) ON DELETE CASCADE,
    video_id VARCHAR(255) UNIQUE NOT NULL, -- YouTube Video ID
    title VARCHAR(255) NOT NULL,
    description TEXT,
    published_at TIMESTAMP,
    thumbnail_url TEXT,
    view_count BIGINT,
    like_count BIGINT,
    comment_count BIGINT,
    duration VARCHAR(50),
    tags TEXT[],
    captions TEXT, -- Full transcript/captions if available
    is_processed BOOLEAN DEFAULT false, -- For AI training
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE youtube_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES youtube_videos(id) ON DELETE CASCADE,
    comment_id VARCHAR(255) UNIQUE NOT NULL,
    author_name VARCHAR(255),
    text_display TEXT,
    like_count INTEGER,
    published_at TIMESTAMP,
    sentiment_score DECIMAL(3, 2), -- AI analysis result
    is_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_youtube_channels_profile_id ON youtube_channels(profile_id);
CREATE INDEX idx_youtube_videos_channel_id ON youtube_videos(channel_id);
CREATE INDEX idx_youtube_comments_video_id ON youtube_comments(video_id);

ALTER TABLE youtube_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_comments ENABLE ROW LEVEL SECURITY;

-- Allow creators to view their own data
CREATE POLICY "Creators can view their own YouTube data" ON youtube_channels
    FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Creators can view their own videos" ON youtube_videos
    FOR SELECT USING (channel_id IN (SELECT id FROM youtube_channels WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
