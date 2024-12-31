import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AIAssistantProps } from './types';

export default function AIAssistant({
  code,
  onSuggestionApply,
  language,
  dictionary,
}: AIAssistantProps) {
  const [query, setQuery] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const handleQuerySubmit = async () => {
    try {
      const response = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, query, language }),
      });
      const result = await response.json();
      setSuggestion(result.suggestion);
    } catch (error) {
      console.error(dictionary?.errorFetchingSuggestion?.replace('{{error}}', error));
    }
  };

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={dictionary?.queryPlaceholder}
      />
      <Button onClick={handleQuerySubmit}>{dictionary?.submitQuery}</Button>
      {suggestion && (
        <div>
          <h3>{dictionary?.suggestion}</h3>
          <pre>{suggestion}</pre>
          <Button onClick={() => onSuggestionApply(suggestion)}>
            {dictionary?.applySuggestion}
          </Button>
        </div>
      )}
    </div>
  );
}
