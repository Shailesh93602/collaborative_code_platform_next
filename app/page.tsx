// app/page.tsx
"use client";
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
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <h1 className="text-4xl font-bold mb-8">
        Advanced Collaborative Code Platform
      </h1>
      <div className="w-full max-w-[1800px] grid grid-cols-12 gap-4">
        <div className="col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <LanguageSelector />
            <BlockchainVersionControl
              code="// Your code here"
              onCodeUpdate={() => {}}
            />
          </div>
          <CodeEditor />
          <TimelineDebugger />
          <CodeExplainer code="// Your code here" />
          <CodeVisualizer code="// Your code here" />
        </div>
        <div className="col-span-4 space-y-4">
          <PeerList />
          <AIAssistant />
          <ExecutionPanel />
          <VisualizationStudio />
          <CollaborativeWhiteboard />
          <PerformanceProfiler code="// Your code here" />
          <MultiLanguageSupport code="// Your code here" />
        </div>
      </div>
    </main>
  );
}
