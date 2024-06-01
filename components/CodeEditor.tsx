import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "./ui/button";

interface CodeEditorProps {
  initialCode: string;
  language: string;
  onCodeChange: (code: string) => void;
  onRunCode: () => void;
}

export function CodeEditor({
  initialCode,
  language,
  onCodeChange,
  onRunCode,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      onCodeChange(value);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Editor
        height="90%"
        language={language}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
      />
      <div className="mt-4">
        <Button onClick={onRunCode}>Run Code</Button>
      </div>
    </div>
  );
}
