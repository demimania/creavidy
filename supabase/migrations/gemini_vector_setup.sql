-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store video embeddings
create table if not exists youtube_video_embeddings (
  id bigint primary key generated always as identity,
  video_id text not null references youtube_videos(video_id) on delete cascade,
  content text, -- The text chunk that was embedded (title + description usually)
  embedding vector(768), -- Gemini text-embedding-004 uses 768 dimensions
  created_at timestamptz default now()
);

-- Create a function to search for similar videos
create or replace function match_video_embeddings (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  video_id text,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query(
    select
      youtube_video_embeddings.video_id,
      youtube_video_embeddings.content,
      1 - (youtube_video_embeddings.embedding <=> query_embedding) as similarity
    from youtube_video_embeddings
    where 1 - (youtube_video_embeddings.embedding <=> query_embedding) > match_threshold
    order by youtube_video_embeddings.embedding <=> query_embedding
    limit match_count
  );
end;
$$;
