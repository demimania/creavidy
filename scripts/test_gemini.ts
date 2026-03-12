import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { generateEmbedding, generateChatResponse } from "../lib/gemini";

async function testGemini() {
    console.log("Testing Embedding...");
    const embedding = await generateEmbedding("Hello world");
    if (embedding && embedding.length > 0) {
        console.log("Embedding success, length:", embedding.length);
    } else {
        console.error("Embedding failed or empty.");
    }

    console.log("Testing Chat...");
    const response = await generateChatResponse("Hello, who are you?");
    console.log("Chat Response:", response);
}

testGemini();
