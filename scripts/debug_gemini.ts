import { GoogleGenerativeAI } from "@google/generative-ai";
const fs = require("fs");
try {
    const env = fs.readFileSync(".env.local", "utf8");
    env.split("\n").forEach((line: string) => {
        const [key, ...values] = line.split("=");
        if (key && values.length > 0) {
            process.env[key.trim()] = values.join("=").trim().replace(/(^"|"$)/g, "");
        }
    });
} catch (e) {
    console.warn("Could not read .env.local", e);
}

async function debugGemini() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("No API key found.");
        return;
    }
    console.log("API Key found (length):", apiKey.length);

    const genAI = new GoogleGenerativeAI(apiKey);

    // Try to use a model, if it fails, catch error
    try {
        console.log("Testing gemini-pro (v1beta)...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello via gemini-pro v1beta");
        console.log("Success gemini-pro v1beta:", result.response.text());
    } catch (e: any) {
        console.error("Failed gemini-pro v1beta:", e.message);
    }

    try {
        console.log("Testing gemini-pro (v1)...");
        // @ts-ignore
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }, { apiVersion: 'v1' });
        const result = await model.generateContent("Hello via gemini-pro v1");
        console.log("Success gemini-pro v1:", result.response.text());
    } catch (e: any) {
        console.error("Failed gemini-pro v1:", e.message);
    }

    try {
        console.log("Testing gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello via gemini-1.5-flash");
        console.log("Success gemini-1.5-flash:", result.response.text());
    } catch (e: any) {
        console.error("Failed gemini-1.5-flash:", e.message);
    }
}

debugGemini();
