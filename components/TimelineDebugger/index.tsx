'use client';

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DebugStep, TimelineDebuggerProps } from './types';

export default function TimelineDebugger({ dictionary }: TimelineDebuggerProps) {
  const [timeline, setTimeline] = useState<DebugStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAllVersions, loadVersion } = useWeb3();

  useEffect(() => {
    const fetchTimeline = async () => {
      setIsLoading(true);
      try {
        const { versions } = await getAllVersions(1, 10);
        const debugSteps = await Promise.all(
          versions.map(async (version, index) => {
            const loadedVersion = await loadVersion(version.hash);
            const { content: code } = loadedVersion.find((file) => file.path === 'main.js') ?? {
              content: '',
            }; // Assuming main.js is the primary file
            return {
              step: index,
              code,
              variables: generateDummyVariables(),
              timestamp: version.timestamp,
            };
          })
        );
        setTimeline(debugSteps);
      } catch (error) {
        console.error('Error fetching debug timeline:', error);
        setError('Failed to fetch versions.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
  }, [getAllVersions, loadVersion, dictionary]);

  const generateDummyVariables = () => {
    return {
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
    };
  };

  const handleStepChange = (value: number[]) => {
    setCurrentStep(value[0]);
    setVariables(timeline[value[0]]?.variables || {});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{dictionary?.title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => handleStepChange([Math.max(0, currentStep - 1)])}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Slider
            value={[currentStep]}
            onValueChange={handleStepChange}
            max={timeline.length - 1}
            step={1}
            className="w-[100px]"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => handleStepChange([Math.min(timeline.length - 1, currentStep + 1)])}
            disabled={currentStep === timeline.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow grid grid-rows-2 gap-4 p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            {dictionary?.codeAtStep?.replace('{{step}}', currentStep)}
          </h3>
          <ScrollArea className="h-[200px] border rounded p-2">
            <pre className="text-sm">{timeline[currentStep]?.code}</pre>
          </ScrollArea>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{dictionary?.variables}</h3>
          <ScrollArea className="h-[200px] border rounded p-2">
            <pre className="text-sm">{JSON.stringify(variables, null, 2)}</pre>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
