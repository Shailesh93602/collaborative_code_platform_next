'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAI } from '@/hooks/useAI';
import { CodeExplainerProps } from './types';

export default function CodeExplainer({ code, dictionary }: CodeExplainerProps) {
  const [explanation, setExplanation] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { getAIResponse } = useAI();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      const explanationPrompt = `${dictionary?.explainCodePrompt}:

${code}`;
      const docPrompt = `${dictionary?.generateDocumentationPrompt}:

${code}`;

      const [explanationResponse, docResponse] = await Promise.all([
        getAIResponse(explanationPrompt),
        getAIResponse(docPrompt),
      ]);

      setExplanation(explanationResponse);
      setDocumentation(docResponse);
    } catch (error) {
      console.error(
        dictionary?.errorGeneratingExplanationAndDocumentation?.replace('{{error}}', error)
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h2 className="text-2xl font-semibold">{dictionary?.codeExplanationAndDocumentation}</h2>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{dictionary?.explanation}</h3>
        <ScrollArea className="h-[200px] border rounded p-2">
          {isLoading ? dictionary?.generatingExplanation : explanation}
        </ScrollArea>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{dictionary?.documentation}</h3>
        <ScrollArea className="h-[200px] border rounded p-2">
          {isLoading ? dictionary?.generatingDocumentation : documentation}
        </ScrollArea>
      </div>
      <Button onClick={generateExplanationAndDocs} disabled={isLoading}>
        {dictionary?.regenerate}
      </Button>
    </div>
  );
}
