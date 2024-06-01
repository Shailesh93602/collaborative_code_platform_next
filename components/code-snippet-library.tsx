"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/useToast.hook";
import { LanguageSelector } from "@/components/LanguageSelector.component";

interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
}

export function CodeSnippetLibrary() {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      const response = await fetch("/api/snippets");
      if (response.ok) {
        const data = await response.json();
        setSnippets(data);
      } else {
        throw new Error("Failed to fetch snippets");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch code snippets. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSnippet = async () => {
    if (!title || !code) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/snippets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, code, language }),
      });

      if (response.ok) {
        toast({
          title: "Snippet Saved",
          description: "Your code snippet has been saved successfully.",
        });
        setTitle("");
        setCode("");
        fetchSnippets();
      } else {
        throw new Error("Failed to save snippet");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save code snippet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSnippet = (snippet: CodeSnippet) => {
    // This function will be called from the parent component
    // to insert the snippet into the main code editor
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Add New Snippet</CardTitle>
          <CardDescription>
            Save commonly used code patterns for quick access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Snippet Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Paste your code here"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={5}
            />
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSaveSnippet}
            disabled={isLoading || !title || !code}
          >
            {isLoading ? "Saving..." : "Save Snippet"}
          </Button>
        </CardFooter>
      </Card>
      <Card className="flex-grow overflow-hidden">
        <CardHeader>
          <CardTitle>Saved Snippets</CardTitle>
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
                    Use Snippet
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
