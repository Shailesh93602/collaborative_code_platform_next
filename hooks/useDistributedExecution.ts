import { useCallback } from 'react';

interface ExecutionResult {
  output: string;
  error?: string;
}

export function useDistributedExecution() {
  const executeCode = useCallback(
    async (code: string, language: string): Promise<ExecutionResult> => {
      try {
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, language }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Error executing code:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to execute code.');
      }
    },
    []
  );

  return { executeCode };
}
