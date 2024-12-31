'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext.context';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LayoutList, LayoutTemplate } from 'lucide-react';

export default function LayoutCustomizer({ dictionary }: { dictionary: any }) {
  const { layout, setLayout } = useTheme();

  return (
    <div className="flex space-x-2">
      {[
        { name: 'default', icon: LayoutTemplate },
        { name: 'compact', icon: LayoutList },
        { name: 'wide', icon: LayoutDashboard },
      ].map(({ name, icon: Icon }) => (
        <Button
          key={name}
          variant={layout === name ? 'default' : 'outline'}
          size="icon"
          onClick={() => setLayout(name as 'default' | 'compact' | 'wide')}
          aria-label={dictionary?.[`layoutCustomizer.${name}Layout`]}
        >
          <Icon className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      ))}
    </div>
  );
}
