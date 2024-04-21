import { useCallback } from "react";
import OpenAI from "openai";
import { AICodeSuggestion } from "@/types/global";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export function useAI() {
  const getAISuggestions = useCallback(
    async (code: string): Promise<AICodeSuggestion[]> => {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are an AI assistant that provides code suggestions. Respond with only the suggested code changes in a JSON format with 'range' and 'text' properties.",
            },
            {
              role: "user",
              content: `Suggest improvements for this code:\n\n${code}`,
            },
          ],
          max_tokens: 150,
        });

        const suggestion = JSON.parse(
          response.choices[0].message.content || "[]"
        );
        return suggestion;
      } catch (error) {
        console.error("Error getting AI suggestions:", error);
        return [];
      }
    },
    []
  );

  const getAIResponse = useCallback(async (query: string): Promise<string> => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant for a collaborative code platform. Provide helpful and concise responses.",
          },
          { role: "user", content: query },
        ],
        max_tokens: 150,
      });

      return (
        response.choices[0].message.content ||
        "I'm sorry, I couldn't generate a response."
      );
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I'm sorry, there was an error generating a response.";
    }
  }, []);

  return { getAISuggestions, getAIResponse };
}
