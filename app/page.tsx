"use client";

import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [code, setCode] = useState<string>("// Your code here");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Collaborative Code Platform</h1>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <BlockchainVersionControl
              code={code}
              onCodeUpdate={(newCode) => setCode(newCode)}
            />
            <PeerList />
          </div>
        </div>
      </header>
      <div className="flex-grow flex overflow-hidden">
        <div className="w-2/3 flex flex-col border-r">
          <CodeEditor
            value={code}
            onChange={(newCode) => setCode(newCode)}
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
  );
}
