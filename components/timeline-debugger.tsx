"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TimelineDebugger() {
  const [timeline, setTimeline] = useState<
    {
      step: number;
      code: string;
      variables: {
        x: number;
        y: number;
      };
    }[]
  >([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [variables, setVariables] = useState({});

  useEffect(() => {
    // Simulating timeline data
    const simulatedTimeline = Array.from({ length: 20 }, (_, i) => ({
      step: i,
      code: `// Step ${i}\nconsole.log('Executing step ${i}');`,
      variables: {
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
      },
    }));
    setTimeline(simulatedTimeline);
  }, []);

  const handleStepChange = (value: number[]) => {
    setCurrentStep(value[0]);
    setVariables(timeline[value[0]]?.variables || {});
  };

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-2xl font-semibold mb-4">Time-Travel Debugger</h2>
      <div className="flex space-x-4 mb-4">
        <Button
          onClick={() => handleStepChange([Math.max(0, currentStep - 1)])}
        >
          Previous
        </Button>
        <Slider
          value={[currentStep]}
          onValueChange={handleStepChange}
          max={timeline.length - 1}
          step={1}
        />
        <Button
          onClick={() =>
            handleStepChange([Math.min(timeline.length - 1, currentStep + 1)])
          }
        >
          Next
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Code at Step {currentStep}
          </h3>
          <ScrollArea className="h-[200px] border rounded p-2">
            <pre>{timeline[currentStep]?.code}</pre>
          </ScrollArea>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Variables</h3>
          <ScrollArea className="h-[200px] border rounded p-2">
            <pre>{JSON.stringify(variables, null, 2)}</pre>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
