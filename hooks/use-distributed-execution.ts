import { useCallback } from "react";

export function useDistributedExecution() {
  const executeCode = useCallback(async (code: string, language: string) => {
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        throw new Error("Execution failed");
      }

      const result = await response.json();
      return result.output;
    } catch (error) {
      console.log(
        "🚀 ~ file: use-distributed-execution.ts:21 ~ executeCode ~ error:",
        error
      );
      console.error("Error executing code:", error);
      return "Error: Failed to execute code.";
    }
  }, []);

  return { executeCode };
}
