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

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [code, setCode] = useState<string>("// Your code here");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Advanced Collaborative Code Platform
        </h1>
      </header>
      <div className="flex-grow flex overflow-hidden">
        <div className="w-3/4 flex flex-col">
          <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-sm">
            <LanguageSelector />
            <BlockchainVersionControl
              code={code}
              onCodeUpdate={(newCode) => setCode(newCode)}
            />
          </div>
          <div className="flex-grow overflow-auto p-4">
            <CodeEditor
              value={code}
              onChange={(newCode) => setCode(newCode)}
              className="h-full"
            />
          </div>
          <div className="h-1/3 overflow-auto p-4 bg-white dark:bg-gray-800 shadow-t-sm">
            <TimelineDebugger />
          </div>
        </div>
        <div className="w-1/4 bg-white dark:bg-gray-800 overflow-auto">
          <div className="p-4 space-y-4">
            <PeerList />
            <AIAssistant />
            <ExecutionPanel code={code} />
            <VisualizationStudio />
            <CollaborativeWhiteboard />
            <PerformanceProfiler code={code} />
            <MultiLanguageSupport code={code} />
            <CodeExplainer code={code} />
            <CodeVisualizer code={code} />
          </div>
        </div>
      </div>
    </main>
  );
}
