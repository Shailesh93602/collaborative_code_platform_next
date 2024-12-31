'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { LANGUAGES } from './constants';
import { LanguageSelectorProps } from './types';
import { useState } from 'react';

export default function LanguageSelector({ dictionary }: LanguageSelectorProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<string>(document.cookie['NEXT_LOCALE'] ?? 'en');

  const handleChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/`;
    setLanguage(newLocale);
    router.push(`/${newLocale}`);
    // router.refresh();
  };

  return (
    <Select onValueChange={handleChange} value={language}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={dictionary?.label} />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
