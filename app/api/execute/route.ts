import { NextResponse } from "next/server";
import { VM } from "vm2";

export async function POST(request: Request) {
  const { code, language } = await request.json();

  if (language !== "javascript") {
    return NextResponse.json(
      { error: "Unsupported language" },
      { status: 400 }
    );
  }

  try {
    // Create a VM instance
    const vm = new VM({
      timeout: 5000, // Prevent infinite loops
      sandbox: {}, // Restrict environment
    });

    // Execute the code inside the sandbox
    const result = vm.run(code);

    return NextResponse.json({ output: String(result) });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
