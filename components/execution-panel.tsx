"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDistributedExecution } from "@/hooks/use-distributed-execution";

export function ExecutionPanel({ code }: { code: string }) {
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const { executeCode } = useDistributedExecution();

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const result = await executeCode(code, "javascript");
      setOutput(result);
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-2xl font-semibold mb-4">Execution Panel</h2>
      <Button onClick={handleExecute} disabled={isExecuting}>
        {isExecuting ? "Executing..." : "Execute Code"}
      </Button>
      <ScrollArea className="h-[200px] mt-4">
        <pre className="text-sm">{output}</pre>
      </ScrollArea>
    </div>
  );
}
