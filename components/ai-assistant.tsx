"use client";

import { FormEvent, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAI } from "@/hooks/use-ai";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Code, Zap } from "lucide-react";
import { AICodeSuggestion } from "@/types/global";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProjectContext } from "@/contexts/project-context";
import { useLocalCache } from "@/hooks/use-local-cache";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AIAssistant({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const [query, setQuery] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AICodeSuggestion[]>([]);
  const [explanation, setExplanation] = useState<string>("");
  const [optimizationSuggestions, setOptimizationSuggestions] =
    useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const {
    getAIResponse,
    getAISuggestions,
    getCodeExplanation,
    getOptimizationSuggestions,
  } = useAI();
  const { projectId } = useProjectContext();

  const { data: cachedSuggestions, invalidateCache } = useLocalCache<
    AICodeSuggestion[]
  >(
    `suggestions-${projectId}-${language}`,
    () => getAISuggestions(code, language, `Project ID: ${projectId}`),
    { expirationTime: 5 * 60 * 1000 } // 5 minutes
  );

  useEffect(() => {
    if (cachedSuggestions) {
      setSuggestions(cachedSuggestions);
    }
  }, [cachedSuggestions]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: query };
    setConversation((prev) => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);
    setError(null);

    try {
      const projectContext = `Project ID: ${projectId}, Language: ${language}`;
      const aiResponse = await getAIResponse(
        query,
        code,
        language,
        projectContext
      );
      const aiMessage: Message = { role: "assistant", content: aiResponse };
      setConversation((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setError(
        "An error occurred while processing your request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainCode = useCallback(async () => {
    setIsLoading(true);
    try {
      const projectContext = `Project ID: ${projectId}`;
      const explanation = await getCodeExplanation(
        code,
        language,
        projectContext
      );
      setExplanation(explanation);
    } catch (error) {
      console.error("Error getting code explanation:", error);
      setExplanation("An error occurred while generating the explanation.");
    } finally {
      setIsLoading(false);
    }
  }, [code, language, projectId, getCodeExplanation]);

  const handleOptimizeSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const projectContext = `Project ID: ${projectId}`;
      const suggestions = await getOptimizationSuggestions(
        code,
        language,
        projectContext
      );
      setOptimizationSuggestions(suggestions);
    } catch (error) {
      console.error("Error getting optimization suggestions:", error);
      setOptimizationSuggestions(
        "An error occurred while generating optimization suggestions."
      );
    } finally {
      setIsLoading(false);
    }
  }, [code, language, projectId, getOptimizationSuggestions]);

  useEffect(() => {
    const debouncedFetchSuggestions = setTimeout(() => {
      invalidateCache();
    }, 1000);

    return () => clearTimeout(debouncedFetchSuggestions);
  }, [code, language, invalidateCache]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow mb-4">
        {conversation.map((message, index) => (
          <Card
            key={index}
            className={`mb-2 ${
              message.role === "user" ? "bg-primary/10" : "bg-secondary/10"
            }`}
          >
            <CardContent className="p-3">
              <p
                className={`text-sm ${
                  message.role === "user" ? "text-primary" : "text-secondary"
                }`}
              >
                {message.role === "user" ? "You" : "AI Assistant"}:
              </p>
              <p className="mt-1">{message.content}</p>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Suggestions:</h3>
        <ul className="list-disc pl-5">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="text-sm">
              {suggestion.text}
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Code Explanation:</h3>
        <Button
          onClick={handleExplainCode}
          disabled={isLoading}
          className="mb-2"
        >
          <Code className="mr-2 h-4 w-4" />
          Explain Code
        </Button>
        {explanation && (
          <Card>
            <CardContent className="p-3">
              <p className="text-sm">{explanation}</p>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          Optimization Suggestions:
        </h3>
        <Button
          onClick={handleOptimizeSuggestions}
          disabled={isLoading}
          className="mb-2"
        >
          <Zap className="mr-2 h-4 w-4" />
          Get Optimization Suggestions
        </Button>
        {optimizationSuggestions && (
          <Card>
            <CardContent className="p-3">
              <p className="text-sm">{optimizationSuggestions}</p>
            </CardContent>
          </Card>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask the AI assistant..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
