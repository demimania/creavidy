-- Add script column to generated_content table if it doesn't exist
-- Run this in your Supabase SQL Editor

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS script TEXT;

-- Also ensure heygen_video_id column exists
ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS heygen_video_id TEXT;

-- Create transactions table if not exists (for Sales page)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    description TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for transactions
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);
