import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AIAssistantProps } from './types';
import { API_NAVIGATION } from '@/constants';

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
      const response = await fetch(API_NAVIGATION.ai.suggestions, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, query, language }),
      });
      const result = await response.json();
      setSuggestion(result.suggestion);
    } catch (error) {
      console.error(dictionary?.Error.FetchingSuggestions?.replace('{{error}}', error));
    }
  };

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={dictionary?.Placeholder?.Query}
      />
      <Button onClick={handleQuerySubmit}>{dictionary?.Button?.SubmitQuery}</Button>
      {suggestion && (
        <div>
          <h3>{dictionary?.Text?.Suggestion}</h3>
          <pre>{suggestion}</pre>
          <Button onClick={() => onSuggestionApply(suggestion)}>
            {dictionary?.Button?.ApplySuggestion}
          </Button>
        </div>
      )}
    </div>
  );
}
