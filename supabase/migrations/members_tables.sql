-- ============================================================================
-- MEMBERS TABLE
-- YouTube kanal üyeleri / aktif fanlar takibi
-- MVP: Yorum analizi + manuel ekleme ile üye tespiti
-- İleride: YouTube Members API (members.list) entegrasyonu
-- ============================================================================
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  channel_id UUID REFERENCES youtube_channels(id) ON DELETE SET NULL,

  -- Üye Bilgileri
  member_name VARCHAR(255) NOT NULL,
  member_channel_id VARCHAR(255), -- YouTube channel ID (UCxxxxx)
  member_channel_url TEXT,
  member_avatar_url TEXT,
  member_email VARCHAR(255), -- Opsiyonel, manuel ekleme için

  -- Üyelik Bilgileri
  membership_level VARCHAR(50) DEFAULT 'fan', -- fan, member, super_member, vip
  source VARCHAR(30) DEFAULT 'comment_analysis', -- comment_analysis, youtube_api, manual, apify
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  membership_start_date TIMESTAMP,
  membership_end_date TIMESTAMP,

  -- Etkileşim Metrikleri
  total_comments INTEGER DEFAULT 0,
  total_likes_given INTEGER DEFAULT 0,
  engagement_score DECIMAL(5, 2) DEFAULT 0.00, -- 0-100 arası skor
  last_comment_at TIMESTAMP,
  last_activity_at TIMESTAMP,
  first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Video Yanıt Durumu
  welcome_video_sent BOOLEAN DEFAULT false,
  welcome_video_id UUID, -- video_responses tablosuna referans
  total_videos_received INTEGER DEFAULT 0,

  -- Durum
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, churned, banned
  is_new BOOLEAN DEFAULT true, -- Yeni üye bildirimi için
  notes TEXT, -- Creator'ın özel notları

  -- Metadata
  raw_data JSONB, -- YouTube API veya Apify'dan gelen ham veri
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Benzersizlik: Aynı creator + aynı YouTube channel ID
  UNIQUE(creator_id, member_channel_id)
);

CREATE INDEX idx_members_creator_id ON members(creator_id);
CREATE INDEX idx_members_channel_id ON members(channel_id);
CREATE INDEX idx_members_member_channel_id ON members(member_channel_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_engagement_score ON members(engagement_score DESC);
CREATE INDEX idx_members_is_new ON members(is_new) WHERE is_new = true;
CREATE INDEX idx_members_joined_at ON members(joined_at DESC);
CREATE INDEX idx_members_source ON members(source);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view their own members"
  ON members FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert their own members"
  ON members FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own members"
  ON members FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own members"
  ON members FOR DELETE
  USING (auth.uid() = creator_id);


-- ============================================================================
-- VIDEO_RESPONSES TABLE
-- Üyelere gönderilen AI video yanıtları
-- Welcome video, yorum yanıtı, milestone videosu vb.
-- ============================================================================
CREATE TABLE IF NOT EXISTS video_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,

  -- Video Türü
  type VARCHAR(30) NOT NULL, -- welcome, comment_reply, milestone, custom

  -- Tetikleyici
  trigger_source VARCHAR(30), -- auto, manual, workflow
  trigger_comment_id UUID REFERENCES youtube_comments(id) ON DELETE SET NULL,

  -- Script & AI
  script_text TEXT, -- AI tarafından üretilen script
  script_language VARCHAR(10) DEFAULT 'tr',
  ai_model_used VARCHAR(50) DEFAULT 'gemini-2.0-flash',
  persona_config JSONB, -- Kullanılan persona ayarları

  -- Video Üretimi
  heygen_video_id VARCHAR(255),
  elevenlabs_audio_id VARCHAR(255),
  avatar_id UUID REFERENCES avatars(id) ON DELETE SET NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  video_duration_seconds INTEGER,

  -- Durum & Onay
  status VARCHAR(20) DEFAULT 'draft',
    -- draft, script_ready, generating, ready, approved, rejected,
    -- delivering, delivered, failed
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,

  -- Dağıtım
  delivery_method VARCHAR(20) DEFAULT 'youtube_comment', -- youtube_comment, youtube_dm, email
  delivered_at TIMESTAMP,
  delivery_youtube_comment_id VARCHAR(255), -- YouTube'a gönderilen yanıt comment ID

  -- Maliyet & Analytics
  generation_cost_cents INTEGER DEFAULT 0,
  processing_time_seconds INTEGER,
  view_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_video_responses_creator_id ON video_responses(creator_id);
CREATE INDEX idx_video_responses_member_id ON video_responses(member_id);
CREATE INDEX idx_video_responses_type ON video_responses(type);
CREATE INDEX idx_video_responses_status ON video_responses(status);
CREATE INDEX idx_video_responses_created_at ON video_responses(created_at DESC);

ALTER TABLE video_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view their own video responses"
  ON video_responses FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert their own video responses"
  ON video_responses FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own video responses"
  ON video_responses FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own video responses"
  ON video_responses FOR DELETE
  USING (auth.uid() = creator_id);


-- ============================================================================
-- ANALYTICS_EVENTS TABLE
-- Tüm önemli olayları kaydeden event log
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  -- Olay Bilgisi
  event_type VARCHAR(50) NOT NULL,
    -- member_detected, member_churned, welcome_video_sent,
    -- comment_reply_sent, video_approved, video_rejected,
    -- video_generated, video_delivered, video_viewed
  event_data JSONB, -- Olaya özel veriler

  -- İlişkiler (opsiyonel)
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  video_response_id UUID REFERENCES video_responses(id) ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_events_creator_id ON analytics_events(creator_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_member_id ON analytics_events(member_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view their own analytics"
  ON analytics_events FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "System can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = creator_id);


-- ============================================================================
-- NOTIFICATIONS TABLE
-- Creator'a gönderilen bildirimler
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,

  -- Bildirim İçeriği
  type VARCHAR(30) NOT NULL,
    -- new_member, member_churned, video_ready, video_delivered,
    -- comment_detected, approval_needed, system
  title VARCHAR(255) NOT NULL,
  message TEXT,

  -- İlişkiler (opsiyonel)
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  video_response_id UUID REFERENCES video_responses(id) ON DELETE SET NULL,

  -- Durum
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,

  -- Metadata
  action_url TEXT, -- Tıklanınca gidilecek sayfa
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_creator_id ON notifications(creator_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = creator_id);
