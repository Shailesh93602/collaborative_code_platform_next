'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext.context';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { ThemeSwitcherProps } from './types';

export default function ThemeSwitcher({ dictionary }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <div className="flex space-x-2">
      {['light', 'dark', 'system'].map((th) => (
        <Button
          key={th}
          variant={theme === th ? 'default' : 'outline'}
          size="icon"
          onClick={() => handleThemeChange(th as 'light' | 'dark' | 'system')}
          aria-label={dictionary?.[`themeSwitcher.${th}Theme`]}
        >
          {th === 'light' && <Sun className="h-[1.2rem] w-[1.2rem]" />}
          {th === 'dark' && <Moon className="h-[1.2rem] w-[1.2rem]" />}
          {th === 'system' && <Monitor className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
      ))}
    </div>
  );
}
