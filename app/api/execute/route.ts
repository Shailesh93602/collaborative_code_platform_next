import { NextResponse } from "next/server";
import * as ivm from "isolated-vm";
import { loadPyodide } from "pyodide";
import { exec } from "child_process";
import { promisify } from "util";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth.util";

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
        compilerOptions: { module: "commonjs" },
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
  java: {
    execute: async (code: string) => {
      // For Java, we'll use a simple approach of writing to a file and compiling
      const fs = await import("fs/promises");
      const path = await import("path");
      const tempDir = await fs.mkdtemp("java-");
      const javaFile = path.join(tempDir, "Main.java");

      await fs.writeFile(javaFile, code);
      await execAsync(`javac ${javaFile}`);
      const { stdout, stderr } = await execAsync(`java -cp ${tempDir} Main`);

      await fs.rm(tempDir, { recursive: true, force: true });

      return stdout || stderr;
    },
  },
  cpp: {
    execute: async (code: string) => {
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
  ruby: {
    execute: async (code: string) => {
      const { stdout, stderr } = await execAsync(
        `ruby -e "${code.replace(/"/g, '\\"')}"`
      );
      return stdout || stderr;
    },
  },
  go: {
    execute: async (code: string) => {
      const fs = await import("fs/promises");
      const path = await import("path");
      const tempDir = await fs.mkdtemp("go-");
      const goFile = path.join(tempDir, "main.go");

      await fs.writeFile(goFile, code);
      const { stdout, stderr } = await execAsync(`go run ${goFile}`);

      await fs.rm(tempDir, { recursive: true, force: true });

      return stdout || stderr;
    },
  },
  rust: {
    execute: async (code: string) => {
      const fs = await import("fs/promises");
      const path = await import("path");
      const tempDir = await fs.mkdtemp("rust-");
      const rustFile = path.join(tempDir, "main.rs");

      await fs.writeFile(rustFile, code);
      await execAsync(`rustc ${rustFile} -o ${path.join(tempDir, "main")}`);
      const { stdout, stderr } = await execAsync(path.join(tempDir, "main"));

      await fs.rm(tempDir, { recursive: true, force: true });

      return stdout || stderr;
    },
  },
  swift: {
    execute: async (code: string) => {
      const fs = await import("fs/promises");
      const path = await import("path");
      const tempDir = await fs.mkdtemp("swift-");
      const swiftFile = path.join(tempDir, "main.swift");

      await fs.writeFile(swiftFile, code);
      const { stdout, stderr } = await execAsync(`swift ${swiftFile}`);

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
