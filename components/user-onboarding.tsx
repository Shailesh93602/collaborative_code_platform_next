"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const steps = [
  {
    title: 'Welcome to the Collaborative Code Platform',
    description: 'This platform allows you to write, execute, and collaborate on code in real-time.',
  },
  {
    title: 'Code Editor',
    description: 'Use our powerful code editor to write and edit your code. It supports multiple languages and provides syntax highlighting.',
  },
  {
    title: 'Execution Panel',
    description: 'Run your code directly in the browser and see the output in real-time.',
  },
  {
    title: 'Visualization Studio',
    description: 'Visualize your data with interactive charts and graphs.',
  },
  {
    title: 'Collaboration Features',
    description: 'Work together with your team in real-time. See others' cursors and changes as they happen.',
  },
];

export function UserOnboarding() {
  const [open, setOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOpen(false);
    }
  };

  const handleSkip = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
          <DialogDescription>
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleSkip}>
            Skip Tutorial
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

