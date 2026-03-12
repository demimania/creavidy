-- RUN THIS ONLY (Create Youtube Tables)

CREATE TABLE IF NOT EXISTS youtube_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    channel_id VARCHAR(255) UNIQUE NOT NULL,
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

CREATE TABLE IF NOT EXISTS youtube_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES youtube_channels(id) ON DELETE CASCADE,
    video_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    published_at TIMESTAMP,
    thumbnail_url TEXT,
    view_count BIGINT,
    like_count BIGINT,
    comment_count BIGINT,
    duration VARCHAR(50),
    tags TEXT[],
    captions TEXT,
    is_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS youtube_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES youtube_videos(id) ON DELETE CASCADE,
    comment_id VARCHAR(255) UNIQUE NOT NULL,
    author_name VARCHAR(255),
    text_display TEXT,
    like_count INTEGER,
    published_at TIMESTAMP,
    sentiment_score DECIMAL(3, 2),
    is_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_youtube_channels_profile_id ON youtube_channels(profile_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_channel_id ON youtube_videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_youtube_comments_video_id ON youtube_comments(video_id);

ALTER TABLE youtube_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_comments ENABLE ROW LEVEL SECURITY;

-- Allow creators to view their own data
CREATE POLICY "Creators can view their own YouTube data" ON youtube_channels
    FOR SELECT USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Creators can view their own videos" ON youtube_videos
    FOR SELECT USING (channel_id IN (SELECT id FROM youtube_channels WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
