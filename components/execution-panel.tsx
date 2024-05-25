"use client";

import { useState } from "react";
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

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
];

export function ExecutionPanel({ code }: { code: string }) {
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const { executeCode } = useDistributedExecution();

  const handleExecute = async () => {
    setIsExecuting(true);
    setOutput("Executing code...");
    try {
      const result = await executeCode(code, language);
      setOutput(
        typeof result === "string" ? result : JSON.stringify(result, null, 2)
      );
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStop = () => {
    setIsExecuting(false);
    setOutput("Execution stopped by user.");
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Execution Panel</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={isExecuting ? handleStop : handleExecute}
            disabled={!code.trim()}
            size="sm"
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
        <ScrollArea className="h-full border rounded-md p-4">
          <pre className="text-sm whitespace-pre-wrap">{output}</pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
