// components/ai-assistant.tsx
"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAI } from "@/hooks/use-ai";

export function AIAssistant() {
  const [query, setQuery] = useState("");
  const [conversation, setConversation] = useState<
    { role: string; content: string }[]
  >([]);
  const { getAIResponse } = useAI();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: "user", content: query };
    setConversation((prev) => [...prev, userMessage]);
    setQuery("");

    const aiResponse = await getAIResponse(query);
    const aiMessage = { role: "assistant", content: aiResponse };
    setConversation((prev) => [...prev, aiMessage]);
  };

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-2xl font-semibold mb-4">AI Assistant</h2>
      <ScrollArea className="h-[300px] mb-4">
        {conversation.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                message.role === "user" ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              {message.content}
            </span>
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask the AI assistant..."
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
