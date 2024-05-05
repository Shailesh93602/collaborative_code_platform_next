"use client";

import { useState, useEffect, useRef } from "react";
import { Editor, Monaco } from "@monaco-editor/react";
import { useCollaboration } from "@/hooks/use-collaboration";
import { useAI } from "@/hooks/use-ai";
import { EditorInstance, AICodeSuggestion } from "@/types/global";

export function CodeEditor() {
  const [code, setCode] = useState<string>("// Write your code here");
  const editorRef = useRef<EditorInstance | null>(null);
  const { collaborativeEdit, onCursorChange } = useCollaboration();
  const { getAISuggestions } = useAI();

  const handleEditorDidMount = (editor: EditorInstance, monaco: Monaco) => {
    console.log(monaco);
    editorRef.current = editor;
    editor.onDidChangeCursorPosition(onCursorChange);
    collaborativeEdit("editor", editor);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (editorRef.current) {
        const suggestions: AICodeSuggestion[] = await getAISuggestions(code);
        editorRef.current.getModel()?.pushEditOperations(
          [],
          suggestions.map((s) => ({ range: s.range, text: s.text })),
          () => null
        );
      }
    };
    const debounce = setTimeout(fetchSuggestions, 1000);
    return () => clearTimeout(debounce);
  }, [code, getAISuggestions]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        height="60vh"
        defaultLanguage="javascript"
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          suggest: {
            showInlineDetails: true,
            showStatusBar: true,
          },
        }}
      />
    </div>
  );
}
