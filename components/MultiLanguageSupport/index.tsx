'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAI } from '@/hooks/useAI.hook';
import { MultiLanguageSupportProps } from '@/types/components';
import { LANGUAGES } from './constants';

export default function MultiLanguageSupport({
  code,
  language,
  onLanguageChange,
  dictionary,
  lang,
}: MultiLanguageSupportProps) {
  const [translatedCode, setTranslatedCode] = useState('');
  const { getAIResponse } = useAI();

  useEffect(() => {
    translateCode();
  }, [lang, code]);

  const translateCode = async () => {
    if (lang === 'en') {
      setTranslatedCode(code);
      return;
    }

    const prompt = `Translate the following code to ${
      LANGUAGES.find((language) => language.code === lang)?.name
    }. Preserve the logic and functionality, but translate comments and string literals:

${code}`;
    const translation = await getAIResponse(prompt);
    setTranslatedCode(translation);
  };

  const handleLanguageChange = (langCode: string) => {
    document.cookie = `NEXT_LOCALE=${langCode};path=/`;
    onLanguageChange(langCode);
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h2 className="text-2xl font-semibold">{dictionary?.title}</h2>
      <Select value={lang} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={dictionary?.selectLanguage} />
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
