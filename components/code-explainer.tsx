"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAI } from "@/hooks/use-ai";

export function CodeExplainer({ code }: { readonly code: string }) {
  const [explanation, setExplanation] = useState("");
  const [documentation, setDocumentation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { getAIResponse } = useAI();

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (code) {
        generateExplanationAndDocs();
      }
    }, 1000);

    return () => clearTimeout(debounce);
  }, [code]);

  const generateExplanationAndDocs = async () => {
    setIsLoading(true);
    try {
      const explanationPrompt = `Explain this code concisely:

${code}`;
      const docPrompt = `Generate documentation for this code:

${code}`;

      const [explanationResponse, docResponse] = await Promise.all([
        getAIResponse(explanationPrompt),
        getAIResponse(docPrompt),
      ]);

      setExplanation(explanationResponse);
      setDocumentation(docResponse);
    } catch (error) {
      console.error("Error generating explanation and documentation:", error);
      setExplanation("Error generating explanation.");
      setDocumentation("Error generating documentation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">
        Code Explanation and Documentation
      </h2>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Explanation</h3>
        <ScrollArea className="h-[200px] border rounded p-2">
          {isLoading ? "Generating explanation..." : explanation}
        </ScrollArea>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Documentation</h3>
        <ScrollArea className="h-[200px] border rounded p-2">
          {isLoading ? "Generating documentation..." : documentation}
        </ScrollArea>
      </div>
      <Button onClick={generateExplanationAndDocs} disabled={isLoading}>
        Regenerate
      </Button>
    </div>
  );
}
