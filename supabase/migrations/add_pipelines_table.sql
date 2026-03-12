-- =============================================
-- PIPELINES — n8n execution pipeline takibi
-- =============================================
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',         -- pending/running/complete/error
  current_step TEXT,                     -- script/image/video/tts/complete/error
  script_output TEXT,
  image_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  error_message TEXT,
  total_credits_used INTEGER DEFAULT 0,
  n8n_execution_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users see own pipelines" ON pipelines FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access" ON pipelines FOR ALL TO service_role USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
