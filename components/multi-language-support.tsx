"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAI } from "@/hooks/use-ai";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
];

export function MultiLanguageSupport({ code }: { readonly code: string }) {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [translatedCode, setTranslatedCode] = useState("");
  const { getAIResponse } = useAI();

  useEffect(() => {
    const translateCode = async () => {
      if (selectedLanguage === "en") {
        setTranslatedCode(code);
        return;
      }

      const prompt = `Translate the following code to ${
        LANGUAGES.find((lang) => lang.code === selectedLanguage)?.name
      }. Preserve the logic and functionality, but translate comments and string literals:\n\n${code}`;

      try {
        const translation = await getAIResponse(prompt);
        setTranslatedCode(translation);
      } catch (error) {
        console.error("Error translating code:", error);
        setTranslatedCode("Error translating code. Please try again.");
      }
    };

    translateCode();
  }, [selectedLanguage, code, getAIResponse]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Multi-language Support</h2>
      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ScrollArea className="h-[300px] border rounded p-2">
        <pre className="text-sm">{translatedCode}</pre>
      </ScrollArea>
    </div>
  );
}
