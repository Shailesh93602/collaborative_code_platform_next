'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { steps } from './constants';
import { UserOnboardingProps } from './types';

export default function UserOnboarding({ onComplete, dictionary }: UserOnboardingProps) {
  const [open, setOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOpen(false);
      onComplete?.();
    }
  };

  const handleSkip = () => {
    setOpen(false);
    onComplete?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dictionary?.steps[currentStep].titleKey}</DialogTitle>
          <DialogDescription>{dictionary?.steps[currentStep].descriptionKey}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleSkip}>
            {dictionary?.skipTutorial}
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? dictionary?.finish : dictionary?.next}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
