import { NextResponse } from "next/server";
import { Client } from "@gradio/client";

export async function POST(request: Request) {
  const { query } = await request.json();

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const client = await Client.connect("Qwen/Qwen2.5-Coder-Artifacts");
    const result = await client.predict("/generation_code", {
      query: query,
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
