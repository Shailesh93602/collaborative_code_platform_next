"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { CodeEditor } from "@/components/CodeEditor.component";
import { ExecutionPanel } from "@/components/ExecutionPanel.Component";
import { VisualizationStudio } from "@/components/VisualizationStudio.component";
import { AIAssistant } from "@/components/AIAssistant.component";
import { TimelineDebugger } from "@/components/TimelineDebugger.component";
import { LanguageSelector } from "@/components/LanguageSelector.component";
import { BlockchainVersionControl } from "@/components/blockchain-version-control";
import { PeerList } from "@/components/PeerList.component";
import { CodeExplainer } from "@/components/CodeExplainer.component";
import { CodeVisualizer } from "@/components/CodeVisualizer.component";
import { CollaborativeWhiteboard } from "@/components/CollaborativeWhiteboard.component";
import { PerformanceProfiler } from "@/components/PerformanceProfiler.component";
import { MultiLanguageSupport } from "@/components/MultiLanguageSupport.component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { signIn, signOut } from "next-auth/react";
import { CollaborationProvider } from "@/components/collaboration-provider";
import { useProjectContext } from "@/contexts/ProjectContext.context";
import { fetchProjectData } from "@/lib/api.util";
import { UserOnboarding } from "@/components/user-onboarding";
import { PluginManager } from "@/components/plugin-manager";
import { CustomFile } from "@/types/file";
import { createFile } from "@/lib/api.util";

const INITIAL_CODE = {
  javascript: `// Your JavaScript code here
console.log('Hello, World!');`,
  typescript: `// Your TypeScript code here
let message: string = 'Hello, World!';
console.log(message);`,
  python: `# Your Python code here
print('Hello, World!')`,
  java: `// Your Java code here
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  cpp: `// Your C++ code here
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  go: `// Your Go code here
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
};

export default function Home() {
  const { data: session, status } = useSession();
  const { projectId, setProjectId } = useProjectContext();
  const [language, setLanguage] = useState<string>("javascript");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [files, setFiles] = useState<CustomFile[]>([
    { path: "main.js", content: INITIAL_CODE.javascript },
  ]);

  const {
    data: projectData,
    isLoading,
    error,
  } = useQuery(["projectData", projectId], () => fetchProjectData(projectId), {
    enabled: !!projectId,
  });

  const [code, setCode] = useState<string>(INITIAL_CODE[language]);

  useEffect(() => {
    if (projectData) {
      setCode(projectData.code);
      setLanguage(projectData.language);
    }
  }, [projectData]);

  const handleCreateFile = async (path: string, content: string) => {
    try {
      await createFile(path, content, false);
      setFiles([...files, { path, content }]);
    } catch (error) {
      console.error("Error creating file:", error);
      // TODO: Add user-facing error message
    }
  };

  // Add similar error handling to handleCreateDirectory, handleDeleteFile, and handleRenameFile functions

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
                files={files}
                onFilesUpdate={(newFiles) => setFiles(newFiles)}
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
                <TabsTrigger value="plugins">Plugins</TabsTrigger>
              </TabsList>
              <TabsContent value="ai" className="p-4 h-full">
                <AIAssistant code={code} language={language} />
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
              <TabsContent value="plugins" className="p-4 h-full">
                <PluginManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        {showOnboarding && <UserOnboarding />}
      </main>
    </CollaborationProvider>
  );
}
