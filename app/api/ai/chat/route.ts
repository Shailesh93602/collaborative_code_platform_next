import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Client } from "@gradio/client";

// import { pipeline } from "@huggingface/transformers";
// let pipe = await pipeline(
//   "text-generation",
//   //   "Qwen/Qwen2.5-Coder-32B-Instruct-GGUF"
//   //   "Qwen/Qwen2.5-Coder-32B-Instruct"
//   "Qwen/Qwen2.5-Coder-Artifacts"
// );

// let out = await pipe([{ role: "user", content: "I love transformers!" }]);
// console.log("🚀 ~ file: route.ts:12 ~ out:", out);

const openai = new OpenAI();
// {
//   organization: process.env.ORGANIZATION_KEY,
//   project: process.env.PROJECT_ID,
//   apiKey: process.env.OPENAI_API_KEY,
// }

export async function POST(request: Request) {
  const { query } = await request.json();

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const client = await Client.connect("Qwen/Qwen2.5-Coder-Artifacts");
    const result = await client.predict("/generation_code", {
      query: "registration page with next js",
    });

    return NextResponse.json({ response: result.data[0] });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
