import { useCallback } from "react";
import { AICodeSuggestion } from "@/types/global";
import { aiService } from "@/services/AIService";

export function useAI() {
  const getAISuggestions = useCallback(
    async (
      code: string = "",
      language: string = "cpp",
      projectContext: string = ""
    ): Promise<AICodeSuggestion[]> => {
      try {
        return await aiService.getCodeSuggestions(
          code,
          language,
          projectContext
        );
      } catch (error) {
        console.error("Error getting AI suggestions:", error);
        throw error;
      }
    },
    []
  );

  const getAIResponse = useCallback(
    async (
      query: string,
      code: string = "",
      language: string = "cpp",
      projectContext: string = ""
    ): Promise<string> => {
      try {
        const context = `The user is working with ${language} code in the following project context: ${projectContext}. Current code:\n${code}`;
        return await aiService.getCodeExplanation(code, language, context);
      } catch (error) {
        console.error("Error getting AI response:", error);
        throw error;
      }
    },
    []
  );

  const getCodeExplanation = useCallback(
    async (
      code: string,
      language: string,
      projectContext: string
    ): Promise<string> => {
      try {
        return await aiService.getCodeExplanation(
          code,
          language,
          projectContext
        );
      } catch (error) {
        console.error("Error getting code explanation:", error);
        throw error;
      }
    },
    []
  );

  const getOptimizationSuggestions = useCallback(
    async (
      code: string,
      language: string,
      projectContext: string
    ): Promise<string> => {
      try {
        return await aiService.getOptimizationSuggestions(
          code,
          language,
          projectContext
        );
      } catch (error) {
        console.error("Error getting optimization suggestions:", error);
        throw error;
      }
    },
    []
  );

  return {
    getAISuggestions,
    getAIResponse,
    getCodeExplanation,
    getOptimizationSuggestions,
  };
}
