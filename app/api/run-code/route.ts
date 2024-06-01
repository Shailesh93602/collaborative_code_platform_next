import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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
    console.error("Error executing JavaScript:", error);
    return { output: "", error: (error as Error).message };
  } finally {
    try {
      await unlink(filePath);
    } catch (unlinkError) {
      console.error("Error deleting temporary file:", unlinkError);
    }
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
    console.error("Error executing Python:", error);
    return { output: "", error: (error as Error).message };
  } finally {
    try {
      await unlink(filePath);
    } catch (unlinkError) {
      console.error("Error deleting temporary file:", unlinkError);
    }
  }
}

async function executeRuby(code: string): Promise<ExecutionResult> {
  const fileName = `${uuidv4()}.rb`;
  const filePath = path.join(TEMP_DIR, fileName);

  try {
    await writeFile(filePath, code);
    const { stdout, stderr } = await execAsync(`ruby ${filePath}`);
    return { output: stdout, error: stderr };
  } catch (error) {
    console.error("Error executing Ruby:", error);
    return { output: "", error: (error as Error).message };
  } finally {
    try {
      await unlink(filePath);
    } catch (unlinkError) {
      console.error("Error deleting temporary file:", unlinkError);
    }
  }
}

async function executeRust(code: string): Promise<ExecutionResult> {
  const fileName = `${uuidv4()}`;
  const filePath = path.join(TEMP_DIR, `${fileName}.rs`);
  const executablePath = path.join(TEMP_DIR, fileName);

  try {
    await writeFile(filePath, code);
    await execAsync(`rustc ${filePath} -o ${executablePath}`);
    const { stdout, stderr } = await execAsync(executablePath);
    return { output: stdout, error: stderr };
  } catch (error) {
    console.error("Error executing Rust:", error);
    return { output: "", error: (error as Error).message };
  } finally {
    try {
      await unlink(filePath);
      await unlink(executablePath);
    } catch (unlinkError) {
      console.error("Error deleting temporary files:", unlinkError);
    }
  }
}

async function executeSwift(code: string): Promise<ExecutionResult> {
  const fileName = `${uuidv4()}.swift`;
  const filePath = path.join(TEMP_DIR, fileName);

  try {
    await writeFile(filePath, code);
    const { stdout, stderr } = await execAsync(`swift ${filePath}`);
    return { output: stdout, error: stderr };
  } catch (error) {
    console.error("Error executing Swift:", error);
    return { output: "", error: (error as Error).message };
  } finally {
    try {
      await unlink(filePath);
    } catch (unlinkError) {
      console.error("Error deleting temporary file:", unlinkError);
    }
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    case "ruby":
      result = await executeRuby(code);
      break;
    case "rust":
      result = await executeRust(code);
      break;
    case "swift":
      result = await executeSwift(code);
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
