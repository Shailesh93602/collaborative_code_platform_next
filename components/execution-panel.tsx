"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDistributedExecution } from "@/hooks/use-distributed-execution";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, StopCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { debounce } from "lodash";
import { logError } from "@/lib/errorLogging";
import { LanguageSelector } from "@/components/language-selector";

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "swift", label: "Swift" },
];

export function ExecutionPanel({ code }: { code: string }) {
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [error, setError] = useState<string | null>(null);
  const { executeCode } = useDistributedExecution();

  const debouncedExecute = useMemo(
    () =>
      debounce(async (code: string, language: string) => {
        setIsExecuting(true);
        setOutput("Executing code...");
        setError(null);
        try {
          const result = await executeCode(code, language);
          setOutput(
            typeof result === "string"
              ? result
              : JSON.stringify(result, null, 2)
          );
        } catch (error) {
          const errorMessage = `Error: ${(error as Error).message}`;
          setError(errorMessage);
          setOutput("Execution failed. Please check the error message above.");
          logError(error as Error, "ExecutionPanel", { code, language });
        } finally {
          setIsExecuting(false);
        }
      }, 500),
    [executeCode]
  );

  const handleExecute = useCallback(() => {
    debouncedExecute(code, language);
  }, [code, language, debouncedExecute]);

  const handleStop = useCallback(() => {
    debouncedExecute.cancel();
    setIsExecuting(false);
    setOutput("Execution stopped by user.");
  }, [debouncedExecute]);

  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Execution Panel</CardTitle>
        <div className="flex items-center space-x-2">
          <LanguageSelector
            value={language}
            onChange={handleLanguageChange}
            languages={SUPPORTED_LANGUAGES}
          />
          <Button
            onClick={isExecuting ? handleStop : handleExecute}
            disabled={!code.trim()}
            size="sm"
            aria-label={isExecuting ? "Stop code execution" : "Run code"}
          >
            {isExecuting ? (
              <>
                <StopCircle className="mr-2 h-4 w-4" /> Stop
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Run Code
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <ScrollArea className="h-full border rounded-md p-4">
          <pre
            className="text-sm whitespace-pre-wrap"
            aria-live="polite"
            aria-atomic="true"
          >
            {output}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
