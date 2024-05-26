"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CodeEditor } from "@/components/code-editor";
import { ExecutionPanel } from "@/components/execution-panel";
import { VisualizationStudio } from "@/components/visualization-studio";
import { AIAssistant } from "@/components/ai-assistant";
import { TimelineDebugger } from "@/components/timeline-debugger";
import { LanguageSelector } from "@/components/language-selector";
import { BlockchainVersionControl } from "@/components/blockchain-version-control";
import { PeerList } from "@/components/peer-list";
import { CodeExplainer } from "@/components/code-explainer";
import { CodeVisualizer } from "@/components/code-visualizer";
import { CollaborativeWhiteboard } from "@/components/collaborative-whiteboard";
import { PerformanceProfiler } from "@/components/performance-profiler";
import { MultiLanguageSupport } from "@/components/multi-language-support";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { signIn, signOut } from "next-auth/react";
import { CollaborationProvider } from "@/components/collaboration-provider";

const INITIAL_CODE = {
  javascript: "// Your JavaScript code here\nconsole.log('Hello, World!');",
  typescript:
    "// Your TypeScript code here\nlet message: string = 'Hello, World!';\nconsole.log(message);",
  python: "# Your Python code here\nprint('Hello, World!')",
  java: '// Your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  cpp: '// Your C++ code here\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
  go: '// Your Go code here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
};

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [code, setCode] = useState<string>(INITIAL_CODE.javascript);
  const [language, setLanguage] = useState<string>("javascript");
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCode(INITIAL_CODE[language] || INITIAL_CODE.javascript);
  }, [language]);

  if (!mounted) return null;

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Button onClick={() => signIn()}>Sign in</Button>
      </div>
    );
  }

  return (
    <CollaborationProvider>
      <main className="flex min-h-screen flex-col bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Collaborative Code Platform</h1>
            <div className="flex items-center space-x-4">
              <LanguageSelector value={language} onChange={setLanguage} />
              <BlockchainVersionControl
                code={code}
                onCodeUpdate={(newCode) => setCode(newCode)}
              />
              <PeerList />
              <Button onClick={() => signOut()}>Sign out</Button>
            </div>
          </div>
        </header>
        <div className="flex-grow flex overflow-hidden">
          <div className="w-2/3 flex flex-col border-r">
            <CodeEditor
              value={code}
              onChange={(newCode) => setCode(newCode)}
              language={language}
              className="h-2/3 border-b"
            />
            <Tabs defaultValue="execution" className="flex-grow">
              <TabsList className="w-full justify-start border-b px-2">
                <TabsTrigger value="execution">Execution</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              <TabsContent value="execution" className="p-4 h-full">
                <ExecutionPanel code={code} />
              </TabsContent>
              <TabsContent value="timeline" className="p-4 h-full">
                <TimelineDebugger />
              </TabsContent>
              <TabsContent value="performance" className="p-4 h-full">
                <PerformanceProfiler code={code} />
              </TabsContent>
            </Tabs>
          </div>
          <div className="w-1/3 flex flex-col">
            <Tabs defaultValue="ai" className="flex-grow">
              <TabsList className="w-full justify-start border-b px-2">
                <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                <TabsTrigger value="visualize">Visualize</TabsTrigger>
                <TabsTrigger value="explain">Explain</TabsTrigger>
                <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
              </TabsList>
              <TabsContent value="ai" className="p-4 h-full">
                <AIAssistant />
              </TabsContent>
              <TabsContent value="visualize" className="p-4 h-full">
                <ScrollArea className="h-full">
                  <VisualizationStudio />
                  <Separator className="my-4" />
                  <CodeVisualizer code={code} />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="explain" className="p-4 h-full">
                <ScrollArea className="h-full">
                  <CodeExplainer code={code} />
                  <Separator className="my-4" />
                  <MultiLanguageSupport code={code} />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="collaborate" className="p-4 h-full">
                <CollaborativeWhiteboard />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </CollaborationProvider>
  );
}
