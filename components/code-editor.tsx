"use client";

import { useState, useEffect, useRef } from "react";
import { Editor, Monaco } from "@monaco-editor/react";
import { useCollaboration } from "@/components/collaboration-provider";
import { useAI } from "@/hooks/use-ai";
import { EditorInstance, AICodeSuggestion } from "@/types/global";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const LANGUAGE_MAPPING = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  cpp: "cpp",
};

export function CodeEditor({
  value,
  onChange,
  language,
  className,
}: {
  readonly value: string;
  readonly onChange: (code: string) => void;
  readonly language: string;
  readonly className?: string;
}) {
  const [code, setCode] = useState<string>(value);
  const editorRef = useRef<EditorInstance | null>(null);
  const { bindMonacoEditor, awareness, conflicts, resolveConflict } =
    useCollaboration();
  const { getAISuggestions } = useAI();

  const handleEditorDidMount = (editor: EditorInstance, monaco: Monaco) => {
    editorRef.current = editor;
    bindMonacoEditor(editor);

    editor.onDidChangeCursorPosition((e) => {
      if (awareness) {
        awareness.setLocalStateField("cursor", {
          anchor: { line: e.position.lineNumber, ch: e.position.column },
          head: { line: e.position.lineNumber, ch: e.position.column },
        });
      }
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      onChange(value);
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

  useEffect(() => {
    if (awareness) {
      awareness.on("change", () => {
        const states = awareness.getStates();
        const cursors = Array.from(states.entries())
          .filter(
            ([clientId, state]: any) =>
              state.cursor && clientId !== awareness.clientID
          )
          .map(([clientId, state]: any) => ({
            clientId,
            cursor: state.cursor,
          }));

        if (editorRef.current) {
          editorRef.current.deltaDecorations(
            [],
            cursors.map((c: any) => ({
              range: {
                startLineNumber: c.cursor.anchor.line,
                startColumn: c.cursor.anchor.ch,
                endLineNumber: c.cursor.head.line,
                endColumn: c.cursor.head.ch,
              },
              options: {
                className: `cursor-${c.clientId}`,
                hoverMessage: { value: `Cursor of user ${c.clientId}` },
              },
            }))
          );
        }
      });
    }
  }, [awareness]);

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <Editor
        height="100%"
        language={LANGUAGE_MAPPING[language] || "plaintext"}
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
      {conflicts.length > 0 && (
        <div className="p-4 bg-yellow-100">
          <Alert variant="destructive">
            <AlertTitle>Conflicts Detected</AlertTitle>
            <AlertDescription>
              {conflicts.map((conflict, index) => (
                <div key={index} className="mb-2">
                  <p>
                    Conflict at position {conflict.start}-{conflict.end}:
                  </p>
                  <p>Local: {conflict.localContent}</p>
                  <p>Remote: {conflict.remoteContent}</p>
                  <Button
                    onClick={() =>
                      resolveConflict(index, conflict.localContent)
                    }
                  >
                    Keep Local
                  </Button>
                  <Button
                    onClick={() =>
                      resolveConflict(index, conflict.remoteContent)
                    }
                  >
                    Keep Remote
                  </Button>
                </div>
              ))}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
