"use client";

import { useState, useEffect } from "react";
import { CodeEditor } from "@/components/code-editor";
import { ExecutionPanel } from "@/components/execution-panel";
import { AIAssistant } from "@/components/ai-assistant";
import { LanguageSelector } from "@/components/language-selector";
import { BlockchainVersionControl } from "@/components/blockchain-version-control";
import { PeerList } from "@/components/peer-list";

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
      <div className="flex-grow flex overflow-hidden p-4 space-x-4">
        <div className="w-3/4 flex flex-col space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <LanguageSelector />
              <BlockchainVersionControl
                code={code}
                onCodeUpdate={(newCode) => setCode(newCode)}
              />
            </div>
            <CodeEditor
              value={code}
              onChange={(newCode) => setCode(newCode)}
              className="h-[60vh]"
            />
          </div>
          <ExecutionPanel code={code} />
        </div>
        <div className="w-1/4 space-y-4">
          <PeerList />
          <AIAssistant />
        </div>
      </div>
    </main>
  );
}
