'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Github } from 'lucide-react';
import { useToast } from '@/hooks/useToast.hook';
import { ProjectImportProps } from './types';

export default function ProjectImport({ dictionary }: ProjectImportProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!repoUrl) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/projects/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to import project');
      }

      const data = await response.json();
      toast({
        title: dictionary?.projectImported,
        description: dictionary?.projectImportedDescription?.replace('{{name}}', data.name),
      });
      setRepoUrl('');
    } catch (error) {
      toast({
        title: dictionary?.importFailed,
        description: dictionary?.importFailedDescription,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{dictionary?.importGitHubProject}</CardTitle>
        <CardDescription>{dictionary?.enterGitHubUrl}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Github className="w-6 h-6" />
          <Input
            placeholder={dictionary?.githubUrlPlaceholder}
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleImport} disabled={isLoading || !repoUrl}>
          {isLoading ? dictionary?.importing : dictionary?.importProject}
        </Button>
      </CardFooter>
    </Card>
  );
}
