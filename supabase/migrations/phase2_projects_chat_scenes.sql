-- ============================================================================
-- PHASE 2: PROJECTS, CHAT_MESSAGES, SCENES
-- Creavidy AI Video Creation Platform — Core MVP Tables
-- ============================================================================

-- ============================================================================
-- PROJECTS TABLE
-- A project is a single video creation session started from the landing page
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadata
  title VARCHAR(500),                        -- AI auto-generates from first prompt
  status VARCHAR(30) DEFAULT 'draft',
    -- draft, planning, generating, review, completed, archived

  -- Initial prompt from landing page
  initial_prompt TEXT NOT NULL,
  style VARCHAR(50) DEFAULT 'cinematic',     -- style selected on landing
  voice_id VARCHAR(100),                     -- ElevenLabs voice if selected
  duration_seconds INTEGER DEFAULT 30,
  aspect_ratio VARCHAR(10) DEFAULT '16:9',

  -- AI Generation Tracking
  ai_model VARCHAR(50),                      -- e.g. gpt-4o, gemini-2.0-flash
  total_credits_used DECIMAL(10,2) DEFAULT 0.00,

  -- Output
  final_video_url TEXT,
  thumbnail_url TEXT,
  export_ready_at TIMESTAMP,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own projects"
    ON projects FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- CHAT_MESSAGES TABLE
-- Full conversation history between user and AI director within a project
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message content
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Rich metadata (attached files, referenced scenes, etc.)
  metadata JSONB DEFAULT '{}',
    -- e.g. { "type": "scene_plan", "scenes": [...] }
    -- e.g. { "type": "clarification", "questions": [...] }
    -- e.g. { "type": "file_ref", "file_url": "..." }

  -- Token usage for credit tracking
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  model_used VARCHAR(50),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(project_id, created_at ASC);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view messages in their own projects"
    ON chat_messages FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert messages into their own projects"
    ON chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- SCENES TABLE
-- Each project is broken into individual scenes by the AI director
-- ============================================================================
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Order
  scene_order INTEGER NOT NULL DEFAULT 0,

  -- Content
  title VARCHAR(255),
  script TEXT,                               -- Voiceover / narration text
  visual_prompt TEXT,                        -- Prompt for image/video generation
  notes TEXT,                                -- Director notes / style instructions

  -- Duration
  duration_seconds DECIMAL(6,2) DEFAULT 5.0,

  -- AI Model Recommendation
  recommended_model VARCHAR(50),             -- e.g. kling, runway, flux, midjourney
  selected_model VARCHAR(50),               -- User's final choice

  -- Generation Status
  status VARCHAR(30) DEFAULT 'draft',
    -- draft, queued, generating, ready, failed

  -- Generated Assets
  image_url TEXT,
  video_url TEXT,
  audio_url TEXT,

  -- Credit cost
  credits_cost DECIMAL(6,2) DEFAULT 0.00,
  credits_used DECIMAL(6,2) DEFAULT 0.00,

  -- Generation metadata
  generation_started_at TIMESTAMP WITH TIME ZONE,
  generation_completed_at TIMESTAMP WITH TIME ZONE,
  generation_error TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id, scene_order ASC);

ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own scenes"
    ON scenes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- TRIGGERS: auto-update updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_scenes_updated_at
    BEFORE UPDATE ON scenes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
