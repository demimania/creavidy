-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  youtube_channel_id VARCHAR(255) UNIQUE,
  youtube_channel_name VARCHAR(255),
  youtube_subscriber_count INTEGER DEFAULT 0,
  youtube_profile_image TEXT,
  youtube_last_sync TIMESTAMP,
  heygen_avatar_id VARCHAR(255),
  heygen_status VARCHAR(20) DEFAULT 'pending',
  elevenlabs_voice_id VARCHAR(255),
  elevenlabs_status VARCHAR(20) DEFAULT 'pending',
  training_video_url TEXT,
  training_video_uploaded_at TIMESTAMP,
  subscription_plan VARCHAR(20) DEFAULT 'starter',
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  stripe_account_id VARCHAR(255),
  stripe_status VARCHAR(20) DEFAULT 'pending',
  monthly_video_minutes INTEGER DEFAULT 0,
  used_video_minutes INTEGER DEFAULT 0,
  credits_balance DECIMAL(10, 2) DEFAULT 0.00,
  theme_config JSONB DEFAULT '{"dark": true, "accentColor": "#D1FE17"}',
  language VARCHAR(10) DEFAULT 'en',
  supported_languages TEXT[] DEFAULT ARRAY['en'],
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_onboarded BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public can view basic profile info by username') THEN
        CREATE POLICY "Public can view basic profile info by username" ON profiles FOR SELECT USING (true);
    END IF;
END $$;

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  ai_prompt_template TEXT,
  max_video_duration INTEGER DEFAULT 300,
  video_language VARCHAR(10) DEFAULT 'en',
  file_url TEXT,
  file_type VARCHAR(20),
  file_size_mb DECIMAL(8, 2),
  external_url TEXT,
  affiliate_tracking_id VARCHAR(255),
  redirect_type VARCHAR(20) DEFAULT 'direct',
  click_count INTEGER DEFAULT 0,
  commission_type VARCHAR(20) DEFAULT 'percentage',
  commission_value DECIMAL(10, 2),
  cover_image TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can view active products from any creator') THEN
        CREATE POLICY "Users can view active products from any creator" ON products FOR SELECT USING (is_active = true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can manage their own products') THEN
        CREATE POLICY "Users can manage their own products" ON products FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  buyer_email VARCHAR(255) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(20),
  buyer_country_code VARCHAR(2),
  prompt_text TEXT,
  response_language VARCHAR(10) DEFAULT 'en',
  custom_instructions TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  platform_fee DECIMAL(10, 2) NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  video_url TEXT,
  video_generated_at TIMESTAMP,
  video_duration_seconds INTEGER,
  video_thumbnail_url TEXT,
  delivery_method VARCHAR(20) DEFAULT 'email',
  delivered_at TIMESTAMP,
  refund_reason VARCHAR(255),
  refunded_at TIMESTAMP,
  refund_amount DECIMAL(10, 2),
  ai_model_used VARCHAR(50) DEFAULT 'heygen_v2',
  generation_cost_cents INTEGER,
  processing_time_seconds INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Sellers can view their own orders') THEN
        CREATE POLICY "Sellers can view their own orders" ON orders FOR SELECT USING (auth.uid() = seller_id);
    END IF;
END $$;

-- ============================================================================
-- AVATARS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  heygen_avatar_id VARCHAR(255),
  elevenlabs_voice_id VARCHAR(255),
  training_video_url TEXT,
  training_uploaded_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'training',
  is_default BOOLEAN DEFAULT false,
  supported_languages TEXT[] DEFAULT ARRAY['en'],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON avatars(user_id);

ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'avatars' AND policyname = 'Users can manage their own avatars') THEN
        CREATE POLICY "Users can manage their own avatars" ON avatars FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- WALLETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  total_earned DECIMAL(15, 2) DEFAULT 0.00,
  pending_balance DECIMAL(15, 2) DEFAULT 0.00,
  available_balance DECIMAL(15, 2) DEFAULT 0.00,
  total_withdrawn DECIMAL(15, 2) DEFAULT 0.00,
  last_withdrawal_at TIMESTAMP,
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_connect_account_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wallets' AND policyname = 'Users can view their own wallet') THEN
        CREATE POLICY "Users can view their own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- CREDIT_TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  amount_minutes DECIMAL(10, 2) NOT NULL,
  amount_usd DECIMAL(10, 2),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  description TEXT,
  balance_after DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'credit_transactions' AND policyname = 'Users can view their own transactions') THEN
        CREATE POLICY "Users can view their own transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;
