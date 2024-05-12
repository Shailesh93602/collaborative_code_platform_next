import { NextResponse } from "next/server";
import { AIService } from "@/lib/services/ai-service";

export async function POST(request: Request) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  try {
    const suggestions = await AIService.getAISuggestions(code);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error in AI suggestions:", error);
    return NextResponse.json(
      { error: "Failed to get AI suggestions" },
      { status: 500 }
    );
  }
}
