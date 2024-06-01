import { NextResponse } from "next/server";
import { aiService } from "@/services/AIService";

export async function POST(request: Request) {
  const { code, type } = await request.json();

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  try {
    const response = await aiService.getCodeExplanation(code, type);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in AI explanation:", error);
    return NextResponse.json(
      { error: "Failed to get AI explanation" },
      { status: 500 }
    );
  }
}
