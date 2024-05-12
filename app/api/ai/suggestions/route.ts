import { Client } from "@gradio/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  try {
    const client = await Client.connect("Qwen/Qwen2.5-Coder-Artifacts");
    const result = await client.predict("/generation_code", {
      query: code + " Provide me suggestions for this code",
    });

    const suggestions = JSON.parse(result.data[0]);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error in AI suggestions:", error);
    return NextResponse.json(
      { error: "Failed to get AI suggestions" },
      { status: 500 }
    );
  }
}
