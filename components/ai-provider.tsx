// components/ai-provider.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const AIContext = createContext<{
  openai: OpenAI;
}>({
  openai,
});

export function AIProvider({ children }: { children: ReactNode }) {
  return <AIContext.Provider value={{ openai }}>{children}</AIContext.Provider>;
}

export const useAIContext = () => useContext(AIContext);
