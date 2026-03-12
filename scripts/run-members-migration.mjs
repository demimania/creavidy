import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://egcubbibsxbuazfldttt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnY3ViYmlic3hidWF6ZmxkdHR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMwMjI4NiwiZXhwIjoyMDg1ODc4Mjg2fQ.CNViGQy6c-ELQLj3ISh1oqy-XQkc8SFQmTDPyfROibg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Full migration SQL to run via Management API
const migrationSQL = `
-- MEMBERS TABLE
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  channel_id UUID REFERENCES youtube_channels(id) ON DELETE SET NULL,
  member_name VARCHAR(255) NOT NULL,
  member_channel_id VARCHAR(255),
  member_channel_url TEXT,
  member_avatar_url TEXT,
  member_email VARCHAR(255),
  membership_level VARCHAR(50) DEFAULT 'fan',
  source VARCHAR(30) DEFAULT 'comment_analysis',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  membership_start_date TIMESTAMP,
  membership_end_date TIMESTAMP,
  total_comments INTEGER DEFAULT 0,
  total_likes_given INTEGER DEFAULT 0,
  engagement_score DECIMAL(5, 2) DEFAULT 0.00,
  last_comment_at TIMESTAMP,
  last_activity_at TIMESTAMP,
  first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  welcome_video_sent BOOLEAN DEFAULT false,
  welcome_video_id UUID,
  total_videos_received INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  is_new BOOLEAN DEFAULT true,
  notes TEXT,
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(creator_id, member_channel_id)
);

CREATE INDEX IF NOT EXISTS idx_members_creator_id ON members(creator_id);
CREATE INDEX IF NOT EXISTS idx_members_channel_id ON members(channel_id);
CREATE INDEX IF NOT EXISTS idx_members_member_channel_id ON members(member_channel_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_engagement_score ON members(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_members_joined_at ON members(joined_at DESC);
CREATE INDEX IF NOT EXISTS idx_members_source ON members(source);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Creators can view their own members" ON members FOR SELECT USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Creators can insert their own members" ON members FOR INSERT WITH CHECK (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Creators can update their own members" ON members FOR UPDATE USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Creators can delete their own members" ON members FOR DELETE USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- VIDEO_RESPONSES TABLE
CREATE TABLE IF NOT EXISTS video_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  type VARCHAR(30) NOT NULL,
  trigger_source VARCHAR(30),
  trigger_comment_id UUID REFERENCES youtube_comments(id) ON DELETE SET NULL,
  script_text TEXT,
  script_language VARCHAR(10) DEFAULT 'tr',
  ai_model_used VARCHAR(50) DEFAULT 'gemini-2.0-flash',
  persona_config JSONB,
  heygen_video_id VARCHAR(255),
  elevenlabs_audio_id VARCHAR(255),
  avatar_id UUID REFERENCES avatars(id) ON DELETE SET NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  video_duration_seconds INTEGER,
  status VARCHAR(20) DEFAULT 'draft',
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  delivery_method VARCHAR(20) DEFAULT 'youtube_comment',
  delivered_at TIMESTAMP,
  delivery_youtube_comment_id VARCHAR(255),
  generation_cost_cents INTEGER DEFAULT 0,
  processing_time_seconds INTEGER,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_video_responses_creator_id ON video_responses(creator_id);
CREATE INDEX IF NOT EXISTS idx_video_responses_member_id ON video_responses(member_id);
CREATE INDEX IF NOT EXISTS idx_video_responses_type ON video_responses(type);
CREATE INDEX IF NOT EXISTS idx_video_responses_status ON video_responses(status);
CREATE INDEX IF NOT EXISTS idx_video_responses_created_at ON video_responses(created_at DESC);

ALTER TABLE video_responses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Creators can view their own video responses" ON video_responses FOR SELECT USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Creators can insert their own video responses" ON video_responses FOR INSERT WITH CHECK (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Creators can update their own video responses" ON video_responses FOR UPDATE USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Creators can delete their own video responses" ON video_responses FOR DELETE USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ANALYTICS_EVENTS TABLE
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  video_response_id UUID REFERENCES video_responses(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_creator_id ON analytics_events(creator_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_member_id ON analytics_events(member_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Creators can view their own analytics" ON analytics_events FOR SELECT USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "System can insert analytics events" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  video_response_id UUID REFERENCES video_responses(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_creator_id ON notifications(creator_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Creators can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Creators can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
`;

async function runMigration() {
  console.log('🚀 Running members migration via Supabase Management API...\n');

  // Use the Management API SQL endpoint
  const response = await fetch(
    `https://egcubbibsxbuazfldttt.supabase.co/rest/v1/rpc/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal',
      },
    }
  );

  // Alternative: Use pg_net or direct SQL through Supabase Dashboard
  // Let's try to verify tables exist by querying them
  console.log('📋 Checking if tables already exist...\n');

  const tables = ['members', 'video_responses', 'analytics_events', 'notifications'];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(0);
    if (error) {
      console.log(`❌ ${table}: Does not exist yet (${error.message})`);
    } else {
      console.log(`✅ ${table}: Already exists`);
    }
  }

  console.log('\n📋 Migration SQL has been saved to:');
  console.log('   supabase/migrations/members_tables.sql');
  console.log('\n🔗 Please run it in Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/egcubbibsxbuazfldttt/sql/new');
  console.log('\n📝 Or copy the SQL from the migration file and paste it into the SQL Editor.');
}

runMigration();
