import { Configuration, OpenAIApi } from "openai";
import { AICodeSuggestion } from "@/types/global";

class AIService {
  private openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async getCodeSuggestions(
    code: string,
    language: string,
    projectContext: string
  ): Promise<AICodeSuggestion[]> {
    try {
      const response = await this.openai.createCompletion({
        model: "text-davinci-002",
        prompt: `Given the following code, language, and project context, suggest improvements or completions:

Language: ${language}
Project Context: ${projectContext}

Code:
${code}

Suggestions:`,
        max_tokens: 150,
        n: 1,
        stop: null,
        temperature: 0.5,
      });

      const suggestions =
        response.data.choices[0].text?.trim().split("\n") || [];
      return suggestions.map((suggestion, index) => ({
        range: {
          startLineNumber: index + 1,
          startColumn: 1,
          endLineNumber: index + 1,
          endColumn: 1,
        },
        text: suggestion,
      }));
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      return [];
    }
  }

  async getCodeExplanation(
    code: string,
    language: string,
    projectContext: string
  ): Promise<string> {
    try {
      const response = await this.openai.createCompletion({
        model: "text-davinci-002",
        prompt: `Explain the following code in the given context:

Language: ${language}
Project Context: ${projectContext}

Code:
${code}

Explanation:`,
        max_tokens: 300,
        n: 1,
        stop: null,
        temperature: 0.7,
      });

      return (
        response.data.choices[0].text?.trim() ||
        "Unable to generate explanation."
      );
    } catch (error) {
      console.error("Error getting code explanation:", error);
      return "An error occurred while generating the explanation.";
    }
  }

  async getOptimizationSuggestions(
    code: string,
    language: string,
    projectContext: string
  ): Promise<string> {
    try {
      const response = await this.openai.createCompletion({
        model: "text-davinci-002",
        prompt: `Suggest optimizations for the following code in the given context:

Language: ${language}
Project Context: ${projectContext}

Code:
${code}

Optimization suggestions:`,
        max_tokens: 200,
        n: 1,
        stop: null,
        temperature: 0.7,
      });

      return (
        response.data.choices[0].text?.trim() ||
        "Unable to generate optimization suggestions."
      );
    } catch (error) {
      console.error("Error getting optimization suggestions:", error);
      return "An error occurred while generating optimization suggestions.";
    }
  }
}

export const aiService = new AIService();
