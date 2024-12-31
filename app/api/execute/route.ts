import { NextResponse } from 'next/server';
import * as ivm from 'isolated-vm';
import { loadPyodide } from 'pyodide';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.util';
import { ModuleKind } from 'typescript';

const execAsync = promisify(exec);

const languageConfigs = {
  javascript: {
    execute: async (code: string) => {
      const isolate = new ivm.Isolate({ memoryLimit: 128 });
      const context = await isolate.createContext();
      const jail = context.global;
      await jail.set('global', jail.derefInto());

      const log = new ivm.Reference((...args: any[]) => {
        console.log(...args);
      });
      await context.global.set('log', log);

      const result = await context.eval(`
        const console = { log: (...args) => log.applyIgnored(undefined, args, { arguments: { copy: true } }) };
        ${code}
      `);
      return result.copy();
    },
  },
  typescript: {
    execute: async (code: string) => {
      const { transpileModule } = await import('typescript');
      const jsCode = transpileModule(code, {
        compilerOptions: { module: ModuleKind.CommonJS },
      }).outputText;
      return languageConfigs.javascript.execute(jsCode);
    },
  },
  python: {
    execute: async (code: string) => {
      const pyodide = await loadPyodide();
      await pyodide.loadPackage('numpy');
      return pyodide.runPython(code);
    },
  },
  java: {
    execute: async (code: string) => {
      const fs = await import('fs/promises');
      const path = await import('path');
      const tempDir = await fs.mkdtemp('java-');
      const javaFile = path.join(tempDir, 'Main.java');

      await fs.writeFile(javaFile, code);
      await execAsync(`javac ${javaFile}`);
      const { stdout, stderr } = await execAsync(`java -cp ${tempDir} Main`);

      await fs.rm(tempDir, { recursive: true, force: true });

      return stdout || stderr;
    },
  },
  cpp: {
    execute: async (code: string) => {
      const fs = await import('fs/promises');
      const path = await import('path');
      const tempDir = await fs.mkdtemp('cpp-');
      const cppFile = path.join(tempDir, 'temp.cpp');
      const exeFile = path.join(tempDir, 'temp.exe');

      await fs.writeFile(cppFile, code);
      await execAsync(`g++ ${cppFile} -o ${exeFile}`);
      const { stdout, stderr } = await execAsync(exeFile);

      await fs.rm(tempDir, { recursive: true, force: true });

      return stdout || stderr;
    },
  },
  go: {
    execute: async (code: string) => {
      const fs = await import('fs/promises');
      const path = await import('path');
      const tempDir = await fs.mkdtemp('go-');
      const goFile = path.join(tempDir, 'main.go');

      await fs.writeFile(goFile, code);
      const { stdout, stderr } = await execAsync(`go run ${goFile}`);

      await fs.rm(tempDir, { recursive: true, force: true });

      return stdout || stderr;
    },
  },
  ruby: {
    execute: async (code: string) => {
      const { stdout, stderr } = await execAsync(`ruby -e "${code.replace(/"/g, '\\"')}"`);
      return stdout || stderr;
    },
  },
  rust: {
    execute: async (code: string) => {
      const fs = await import('fs/promises');
      const path = await import('path');
      const tempDir = await fs.mkdtemp('rust-');
      const rustFile = path.join(tempDir, 'main.rs');

      await fs.writeFile(rustFile, code);
      await execAsync(`rustc ${rustFile} -o ${path.join(tempDir, 'main')}`);
      const { stdout, stderr } = await execAsync(path.join(tempDir, 'main'));

      await fs.rm(tempDir, { recursive: true, force: true });

      return stdout || stderr;
    },
  },
  swift: {
    execute: async (code: string) => {
      const fs = await import('fs/promises');
      const path = await import('path');
      const tempDir = await fs.mkdtemp('swift-');
      const swiftFile = path.join(tempDir, 'main.swift');

      await fs.writeFile(swiftFile, code);
      const { stdout, stderr } = await execAsync(`swift ${swiftFile}`);

      await fs.rm(tempDir, { recursive: true, force: true });

      return stdout || stderr;
    },
  },
  csharp: {
    execute: async (code: string) => {
      const fs = await import('fs/promises');
      const path = await import('path');
      const tempDir = await fs.mkdtemp('csharp-');
      const csFile = path.join(tempDir, 'Program.cs');

      await fs.writeFile(csFile, code);
      await execAsync(`dotnet new console -o ${tempDir} --force`);
      await fs.writeFile(csFile, code);
      const { stdout, stderr } = await execAsync(`dotnet run --project ${tempDir}`);

      await fs.rm(tempDir, { recursive: true, force: true });

      return stdout || stderr;
    },
  },
  php: {
    execute: async (code: string) => {
      const { stdout, stderr } = await execAsync(`php -r "${code.replace(/"/g, '\\"')}"`);
      return stdout || stderr;
    },
  },
  kotlin: {
    execute: async (code: string) => {
      const fs = await import('fs/promises');
      const path = await import('path');
      const tempDir = await fs.mkdtemp('kotlin-');
      const ktFile = path.join(tempDir, 'main.kt');

      await fs.writeFile(ktFile, code);
      await execAsync(`kotlinc ${ktFile} -include-runtime -d ${path.join(tempDir, 'main.jar')}`);
      const { stdout, stderr } = await execAsync(`java -jar ${path.join(tempDir, 'main.jar')}`);

      await fs.rm(tempDir, { recursive: true, force: true });

      return stdout || stderr;
    },
  },
  scala: {
    execute: async (code: string) => {
      const fs = await import('fs/promises');
      const path = await import('path');
      const tempDir = await fs.mkdtemp('scala-');
      const scalaFile = path.join(tempDir, 'Main.scala');

      await fs.writeFile(scalaFile, code);
      const { stdout, stderr } = await execAsync(`scala ${scalaFile}`);

      await fs.rm(tempDir, { recursive: true, force: true });

      return stdout || stderr;
    },
  },
  dart: {
    execute: async (code: string) => {
      const fs = await import('fs/promises');
      const path = await import('path');
      const tempDir = await fs.mkdtemp('dart-');
      const dartFile = path.join(tempDir, 'main.dart');

      await fs.writeFile(dartFile, code);
      const { stdout, stderr } = await execAsync(`dart ${dartFile}`);

      await fs.rm(tempDir, { recursive: true, force: true });

      return stdout || stderr;
    },
  },
  r: {
    execute: async (code: string) => {
      const { stdout, stderr } = await execAsync(`Rscript -e "${code.replace(/"/g, '\\"')}"`);
      return stdout || stderr;
    },
  },
  julia: {
    execute: async (code: string) => {
      const { stdout, stderr } = await execAsync(`julia -e "${code.replace(/"/g, '\\"')}"`);
      return stdout || stderr;
    },
  },
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code, language } = await request.json();

  if (!languageConfigs[language]) {
    return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
  }

  try {
    const result = await languageConfigs[language].execute(code);
    return NextResponse.json({ output: result });
  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
