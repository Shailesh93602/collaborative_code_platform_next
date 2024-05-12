import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code, language } = await request.json();

  if (!code || !language) {
    return NextResponse.json(
      { error: "Code and language are required" },
      { status: 400 }
    );
  }

  try {
    // For security reasons, we're not actually executing the code.
    // Instead, we're returning a mock response.
    const mockOutput = `Executed ${language} code:\n${code}\n\nMock output: Code execution successful`;
    return NextResponse.json({ output: mockOutput });
  } catch (error) {
    console.error("Error executing code:", error);
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}
