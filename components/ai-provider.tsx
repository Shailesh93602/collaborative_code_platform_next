"use client";

import { createContext, useContext, ReactNode } from "react";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

type AIContextType = {
  openai: OpenAIApi;
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  return <AIContext.Provider value={{ openai }}>{children}</AIContext.Provider>;
}

export const useAIContext = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAIContext must be used within an AIProvider");
  }
  return context;
};
