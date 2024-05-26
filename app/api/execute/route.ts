import { NextResponse } from "next/server";
import * as ivm from "isolated-vm";
import { loadPyodide } from "pyodide";
import { exec } from "child_process";
import { promisify } from "util";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const execAsync = promisify(exec);

const languageConfigs = {
  javascript: {
    execute: async (code: string) => {
      const isolate = new ivm.Isolate({ memoryLimit: 128 });
      const context = await isolate.createContext();
      const jail = context.global;
      await jail.set("global", jail.derefInto());

      const log = new ivm.Reference((...args: any[]) => {
        console.log(...args);
      });
      await context.global.set("log", log);

      const result = await context.eval(`
        const console = { log: (...args) => log.applyIgnored(undefined, args, { arguments: { copy: true } }) };
        ${code}
      `);
      return result.copy();
    },
  },
  typescript: {
    execute: async (code: string) => {
      // For simplicity, we'll transpile TypeScript to JavaScript and then execute it
      const { transpileModule } = await import("typescript");
      const jsCode = transpileModule(code, {
        compilerOptions: { module: "commonjs" as any },
      }).outputText;
      return languageConfigs.javascript.execute(jsCode);
    },
  },
  python: {
    execute: async (code: string) => {
      const pyodide = await loadPyodide();
      await pyodide.loadPackage("numpy");
      return pyodide.runPython(code);
    },
  },
  cpp: {
    execute: async (code: string) => {
      // For C++, we'll use a simple approach of writing to a file and compiling
      // This is not secure for production use, but serves as a demonstration
      const fs = await import("fs/promises");
      const path = await import("path");
      const tempDir = await fs.mkdtemp("cpp-");
      const cppFile = path.join(tempDir, "temp.cpp");
      const exeFile = path.join(tempDir, "temp.exe");

      await fs.writeFile(cppFile, code);
      await execAsync(`g++ ${cppFile} -o ${exeFile}`);
      const { stdout, stderr } = await execAsync(exeFile);

      await fs.rm(tempDir, { recursive: true, force: true });

      return stdout || stderr;
    },
  },
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, language } = await request.json();

  if (!languageConfigs[language]) {
    return NextResponse.json(
      { error: "Unsupported language" },
      { status: 400 }
    );
  }

  try {
    const result = await languageConfigs[language].execute(code);
    return NextResponse.json({ output: result });
  } catch (error) {
    console.error("Execution error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
