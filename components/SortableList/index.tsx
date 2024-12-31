import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortableListProps } from './types';

export function SortableList({ items, dictionary, lang }: SortableListProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedItems = useMemo(() => {
    const collator = new Intl.Collator(lang);
    return [...items].sort((a, b) => {
      const comparison = collator.compare(a.name, b.name);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [items, sortOrder, lang]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Select
          value={lang}
          onValueChange={(value) => (document.cookie = `NEXT_LOCALE=${value};path=/`)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={dictionary?.selectLanguage} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{dictionary?.english}</SelectItem>
            <SelectItem value="hi">{dictionary?.hindi}</SelectItem>
            <SelectItem value="gu">{dictionary?.gujarati}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={toggleSortOrder}>
          {sortOrder === 'asc' ? dictionary?.sortAscending : dictionary?.sortDescending}
        </Button>
      </div>
      <ul className="space-y-2">
        {sortedItems.map((item) => (
          <li key={item.id} className="p-2 bg-secondary rounded">
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
