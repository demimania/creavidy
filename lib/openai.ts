import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn("OPENAI_API_KEY is missing");
}

const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function generateChatResponse(prompt: string, context: string = ""): Promise<string> {
    if (!openai) {
        return "AI service is not configured. Please add OPENAI_API_KEY to your environment.";
    }

    try {
        const systemPrompt = `You are Creavidy's Digital Twin AI assistant. You know everything about the user's YouTube channel.

YOUR TASKS:
- Provide insights about the user's YouTube channel and videos
- Suggest content strategy and video ideas
- Analyze comments and give audience engagement tips
- Help with the user's digital avatars

LANGUAGE RULES:
1. Default language is ENGLISH
2. AUTOMATICALLY detect the user's language from their message
3. ALWAYS respond in the SAME language the user writes to you
4. Supported languages: English, Turkish, German, French, Spanish, Italian, Portuguese, Japanese
5. Be friendly, helpful, and creative

${context ? `=== USER DATA ===\n${context}` : "The user's YouTube channel is not connected yet. Suggest connecting their YouTube channel to Creavidy."}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.7
        });

        return response.choices[0]?.message?.content || "Could not generate response.";
    } catch (error: any) {
        console.error("OpenAI Error:", error);

        if (error.status === 429) {
            return "The AI is currently overloaded. Please try again in 30 seconds.";
        }
        if (error.status === 401) {
            return "Invalid API key. Please contact the administrator.";
        }

        return `An error occurred: ${error.message}`;
    }
}

export async function generateScript(topic: string): Promise<string> {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        console.warn("GEMINI_API_KEY is missing, returning topic as-is");
        return topic;
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are a professional video script writer. Write a short, impactful, and natural speech script (30-60 seconds) for: ${topic}\n\nMatch the language of the topic. Return only the script text, no extra commentary.`
                        }]
                    }],
                    generationConfig: { temperature: 0.8, maxOutputTokens: 500 },
                }),
            }
        );

        if (!response.ok) throw new Error(`Gemini error: ${response.statusText}`);
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || topic;
    } catch (error) {
        console.error("Script generation error:", error);
        return topic;
    }
}
