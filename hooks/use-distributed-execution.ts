import { useCallback } from "react";

const EXECUTION_NODES = [
  "http://node1.example.com",
  "http://node2.example.com",
  "http://node3.example.com",
];

export function useDistributedExecution() {
  const executeCode = useCallback(async (code: string, language: string) => {
    try {
      // Randomly select a node for execution
      const node =
        EXECUTION_NODES[Math.floor(Math.random() * EXECUTION_NODES.length)];

      const response = await fetch(`${node}/execute`, {
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
      console.error("Error executing code:", error);
      return "Error: Failed to execute code on the distributed network.";
    }
  }, []);

  return { executeCode };
}
