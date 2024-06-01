import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { query, context } = await request.json();

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant for a collaborative code platform. Provide helpful and concise responses. Use the provided context to give more accurate and relevant answers.",
        },
        { role: "user", content: `Context: ${context}\n\nQuery: ${query}` },
      ],
      max_tokens: 300,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const aiResponse =
      response.choices[0].message.content ||
      "I'm sorry, I couldn't generate a response.";
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
