'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/useToast';
import LanguageSelector from '@/components/LanguageSelector/index';
import { CodeSnippetLibraryProps } from './types';
import { CodeSnippet } from '@prisma/client';

export default function CodeSnippetLibrary({
  onCodeChange,
  dictionary,
}: CodeSnippetLibraryProps = {}) {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      const response = await fetch('/api/snippets');
      if (response.ok) {
        const data = await response.json();
        setSnippets(data);
      } else {
        throw new Error('Failed to fetch snippets');
      }
    } catch (error) {
      toast({
        title: dictionary?.error,
        description: dictionary?.fetchSnippetsError,
        variant: 'destructive',
      });
    }
  };

  const handleSaveSnippet = async () => {
    if (!title || !code) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/snippets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, code, language }),
      });

      if (response.ok) {
        toast({
          title: dictionary?.snippetSaved,
          description: dictionary?.snippetSavedDescription,
        });
        setTitle('');
        setCode('');
        fetchSnippets();
      } else {
        throw new Error('Failed to save snippet');
      }
    } catch (error) {
      toast({
        title: dictionary?.error,
        description: dictionary?.saveSnippetError,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSnippet = (snippet: CodeSnippet) => {
    if (onCodeChange) {
      onCodeChange(snippet.code);
    }
    toast({
      title: dictionary?.snippetUsed,
      description: dictionary?.snippetUsedDescription?.replace('{{title}}', snippet.title),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{dictionary?.addNewSnippet}</CardTitle>
          <CardDescription>{dictionary?.addNewSnippetDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder={dictionary?.snippetTitle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder={dictionary?.pasteCodeHere}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={5}
            />
            <LanguageSelector />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSnippet} disabled={isLoading || !title || !code}>
            {isLoading ? dictionary?.saving : dictionary?.saveSnippet}
          </Button>
        </CardFooter>
      </Card>
      <Card className="flex-grow overflow-hidden">
        <CardHeader>
          <CardTitle>{dictionary?.savedSnippets}</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {snippets.map((snippet) => (
              <Card key={snippet.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{snippet.title}</CardTitle>
                  <CardDescription>{snippet.language}</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-2 rounded-md">
                    <code>{snippet.code}</code>
                  </pre>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleUseSnippet(snippet)}>
                    {dictionary?.useSnippet}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
