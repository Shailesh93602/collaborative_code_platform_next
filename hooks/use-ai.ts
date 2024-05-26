import { useCallback } from "react";
import { AICodeSuggestion } from "@/types/global";

export function useAI() {
  const getAISuggestions = useCallback(
    async (code: string): Promise<AICodeSuggestion[]> => {
      try {
        const response = await fetch("/api/ai/suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error("Failed to get AI suggestions");
        }

        const data = await response.json();
        return data.suggestions;
      } catch (error) {
        console.error("Error getting AI suggestions:", error);
        return [];
      }
    },
    []
  );

  const getAIResponse = useCallback(async (query: string): Promise<string> => {
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I'm sorry, I encountered an error while processing your request.";
    }
  }, []);

  return { getAISuggestions, getAIResponse };
}
