import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();
// {
//   apiKey: process.env.OPENAI_API_KEY,
// }

export async function POST(request: Request) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "o1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that provides code suggestions. Respond with only the suggested code changes in a JSON format with 'range' and 'text' properties.",
        },
        {
          role: "user",
          content: `Suggest improvements for this code:\n\n${code}`,
        },
      ],
      max_tokens: 150,
    });

    const suggestions = JSON.parse(response.choices[0].message.content || "[]");
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error in AI suggestions:", error);
    return NextResponse.json(
      { error: "Failed to get AI suggestions" },
      { status: 500 }
    );
  }
}
