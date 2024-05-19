"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollaboration } from "@/hooks/use-collaboration";
import { User } from "@/types/global";

const LANGUAGES = [
  { id: "javascript", name: "JavaScript" },
  { id: "python", name: "Python" },
  { id: "rust", name: "Rust" },
  { id: "go", name: "Go" },
  { id: "custom", name: "Custom Language" },
];

export function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [customLanguages, setCustomLanguages] = useState<User[]>([]);
  const { changeEditorLanguage } = useCollaboration();

  useEffect(() => {
    // Simulating fetching custom languages
    const fetchCustomLanguages = async () => {
      // This would be an API call in a real application
      const response = await new Promise((resolve) =>
        setTimeout(
          () =>
            resolve([
              { id: "customLang1", name: "Custom Lang 1" },
              { id: "customLang2", name: "Custom Lang 2" },
            ]),
          1000
        )
      );
      setCustomLanguages(response as User[]);
    };
    fetchCustomLanguages();
  }, []);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    changeEditorLanguage(value);
  };

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.id} value={lang.id}>
            {lang.name}
          </SelectItem>
        ))}
        {customLanguages.map((lang: User) => (
          <SelectItem key={lang.id} value={lang.id}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
