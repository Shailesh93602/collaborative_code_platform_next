import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const execAsync = promisify(exec);

const TEMP_DIR = path.join(process.cwd(), "tmp");

interface ExecutionResult {
  output: string;
  error?: string;
}

async function executeJavaScript(code: string): Promise<ExecutionResult> {
  const fileName = `${uuidv4()}.js`;
  const filePath = path.join(TEMP_DIR, fileName);

  try {
    await writeFile(filePath, code);
    const { stdout, stderr } = await execAsync(`node ${filePath}`);
    return { output: stdout, error: stderr };
  } catch (error) {
    return { output: "", error: (error as Error).message };
  } finally {
    await unlink(filePath);
  }
}

async function executePython(code: string): Promise<ExecutionResult> {
  const fileName = `${uuidv4()}.py`;
  const filePath = path.join(TEMP_DIR, fileName);

  try {
    await writeFile(filePath, code);
    const { stdout, stderr } = await execAsync(`python ${filePath}`);
    return { output: stdout, error: stderr };
  } catch (error) {
    return { output: "", error: (error as Error).message };
  } finally {
    await unlink(filePath);
  }
}

export async function POST(request: Request) {
  const { code, language } = await request.json();

  if (!code || !language) {
    return NextResponse.json(
      { error: "Code and language are required" },
      { status: 400 }
    );
  }

  let result: ExecutionResult;

  switch (language) {
    case "javascript":
      result = await executeJavaScript(code);
      break;
    case "python":
      result = await executePython(code);
      break;
    default:
      return NextResponse.json(
        { error: "Unsupported language" },
        { status: 400 }
      );
  }

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ output: result.output });
}
