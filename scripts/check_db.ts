import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    "https://egcubbibsxbuazfldttt.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnY3ViYmlic3hidWF6ZmxkdHR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMwMjI4NiwiZXhwIjoyMDg1ODc4Mjg2fQ.CNViGQy6c-ELQLj3ISh1oqy-XQkc8SFQmTDPyfROibg"
);

async function checkData() {
    console.log("Checking YouTube Channel data...");
    const { data: channels, error: channelError } = await supabase
        .from('youtube_channels')
        .select('*')
        .order('last_synced_at', { ascending: false })
        .limit(1);

    if (channelError) {
        console.error("Channel Error:", channelError);
        return;
    }

    if (!channels || channels.length === 0) {
        console.log("No channels found.");
        return;
    }

    const channel = channels[0];
    console.log("Channel Data:", JSON.stringify({
        id: channel.id,
        channel_id: channel.channel_id,
        title: channel.title,
        subscriber_count: channel.subscriber_count,
        video_count: channel.video_count,
        view_count: channel.view_count
    }, null, 2));

    console.log("Checking YouTube Videos data...");
    const { data: videos, error: videoError } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('channel_id', channel.id);

    if (videoError) {
        console.error("Video Error:", videoError);
    } else {
        console.log(`Found ${videos?.length} videos for UUID: ${channel.id}`);
        videos?.forEach(v => {
            console.log(` - [${v.video_id}] ${v.title} (Views: ${v.view_count})`);
        });
    }

    // Also check for the YouTube String ID just in case
    const { data: videosById } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('channel_id', channel.channel_id as any);

    if (videosById && videosById.length > 0) {
        console.log(`WARNING: Found ${videosById.length} videos linked to STRING ID instead of UUID!`);
    }
}

checkData();
