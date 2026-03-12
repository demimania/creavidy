-- Create ENUMs for status tracking
CREATE TYPE avatar_status AS ENUM ('pending', 'uploading', 'processing', 'ready', 'failed');
CREATE TYPE content_status AS ENUM ('generating', 'ready', 'published', 'failed');

-- Create AVATARS table
CREATE TABLE IF NOT EXISTS avatars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    video_source_url TEXT, -- URL to the calibration video in Storage
    voice_source_url TEXT, -- URL to the voice sample in Storage
    heygen_id TEXT,        -- External ID from HeyGen API
    fishaudio_id TEXT,     -- External ID from FishAudio API
    name TEXT,             -- Name of the avatar (e.g., "Digital Jon")
    status avatar_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for avatars
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own avatars" 
ON avatars FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own avatars" 
ON avatars FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own avatars" 
ON avatars FOR UPDATE 
USING (auth.uid() = user_id);

-- Create GENERATED_CONTENT table
CREATE TABLE IF NOT EXISTS generated_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    avatar_id UUID REFERENCES avatars(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Denormalized for easier RLS
    prompt TEXT NOT NULL,         -- The text/instruction given by user
    video_url TEXT,               -- The resulting video URL
    thumbnail_url TEXT,           -- Thumbnail for the video
    duration INTEGER,             -- Duration in seconds
    status content_status DEFAULT 'generating',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for generated_content
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content" 
ON generated_content FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content" 
ON generated_content FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create Storage Buckets (Instructional - distinct from SQL typically, but good for reference)
-- insert into storage.buckets (id, name) values ('avatar-assets', 'avatar-assets');
-- insert into storage.buckets (id, name) values ('generated-videos', 'generated-videos');
