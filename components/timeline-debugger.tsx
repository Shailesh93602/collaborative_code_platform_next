"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useWeb3 } from "@/hooks/use-web3";

interface DebugStep {
  step: number;
  code: string;
  variables: Record<string, any>;
  timestamp: number;
}

export function TimelineDebugger() {
  const [timeline, setTimeline] = useState<DebugStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const { getAllVersions, loadVersion } = useWeb3();

  useEffect(() => {
    fetchDebugTimeline();
  }, []);

  const fetchDebugTimeline = async () => {
    try {
      const versions = await getAllVersions();
      const debugSteps = await Promise.all(
        versions.map(async (version, index) => {
          const { code, timestamp } = await loadVersion(version.hash);
          return {
            step: index,
            code,
            variables: generateDummyVariables(), // Replace with actual variable state when available
            timestamp,
          };
        })
      );
      setTimeline(debugSteps);
    } catch (error) {
      console.error("Error fetching debug timeline:", error);
    }
  };

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Time-Travel Debugger
        </CardTitle>
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
            onClick={() =>
              handleStepChange([Math.min(timeline.length - 1, currentStep + 1)])
            }
            disabled={currentStep === timeline.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 p-4 flex-grow">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Code at Step {currentStep}</h3>
          <ScrollArea className="h-[200px] border rounded p-2">
            <pre className="text-sm">{timeline[currentStep]?.code}</pre>
          </ScrollArea>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Variables</h3>
          <ScrollArea className="h-[200px] border rounded p-2">
            <pre className="text-sm">{JSON.stringify(variables, null, 2)}</pre>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
