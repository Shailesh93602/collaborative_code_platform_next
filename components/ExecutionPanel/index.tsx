import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExecutionPanelProps } from './types';

export default function ExecutionPanel({ code, onCodeChange, dictionary }: ExecutionPanelProps) {
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCode = async () => {
    setIsExecuting(true);
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const result = await response.json();
      setOutput(result.output);
    } catch (error) {
      setOutput(dictionary?.executionError);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Button onClick={executeCode} disabled={isExecuting}>
        {isExecuting ? dictionary?.executing : dictionary?.execute}
      </Button>
      <ScrollArea className="flex-grow mt-4 p-2 border rounded">
        <pre>{output ?? dictionary?.noOutput}</pre>
      </ScrollArea>
    </div>
  );
}
