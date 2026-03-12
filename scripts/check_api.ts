import { google } from 'googleapis';

const youtube = google.youtube({
    version: 'v3',
    auth: 'AIzaSyAh4H9U6bJXEoxXrh_DpQfdmnFN3WFBZdg'
});

async function checkChannel() {
    console.log("Checking @burhan.kocabiyik via API...");
    const res = await youtube.channels.list({
        part: ["statistics", "snippet", "contentDetails"],
        forHandle: "@burhan.kocabiyik"
    });

    if (res.data.items && res.data.items.length > 0) {
        const item = res.data.items[0];
        console.log("Stats:", JSON.stringify(item.statistics, null, 2));
        console.log("ContentDetails:", JSON.stringify(item.contentDetails, null, 2));
    } else {
        console.log("Channel not found.");
    }
}

checkChannel();
