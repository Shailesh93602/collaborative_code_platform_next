"use client";

import { useState, useEffect, useRef } from "react";
import { Editor, Monaco } from "@monaco-editor/react";
import { useCollaboration } from "@/components/collaboration-provider";
import { useAI } from "@/hooks/useAI.hook";
import { EditorInstance, AICodeSuggestion } from "@/types/global";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const LANGUAGE_MAPPING: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  cpp: "cpp",
};

interface CodeEditorProps {
  value: string;
  onChange: (code: string) => void;
  language: string;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language,
  className,
}: CodeEditorProps) {
  const [code, setCode] = useState<string>(value);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<EditorInstance | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const { bindMonacoEditor, awareness, conflicts, resolveConflict } =
    useCollaboration();
  const { getAISuggestions } = useAI();
  const [isLoading, setIsLoading] = useState(true);

  const handleEditorDidMount = (editor: EditorInstance, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    bindMonacoEditor(editor);

    editor.onDidChangeCursorPosition((e) => {
      if (awareness) {
        awareness.setLocalStateField("cursor", {
          anchor: { line: e.position.lineNumber, ch: e.position.column },
          head: { line: e.position.lineNumber, ch: e.position.column },
        });
      }
    });

    // Enable code folding
    editor.updateOptions({ folding: true });

    // Enable minimap
    editor.updateOptions({ minimap: { enabled: true } });

    // Improve keyboard navigation
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.F10, () => {
      editor.trigger("keyboard", "editor.action.nextEditorWidget", {});
    });

    setIsLoading(false);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      onChange(value);
      setError(null);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (editorRef.current && monacoRef.current) {
        const suggestions: AICodeSuggestion[] = await getAISuggestions(
          code,
          language
        );
        editorRef.current.getModel()?.pushEditOperations(
          [],
          suggestions.map((s) => ({ range: s.range, text: s.text })),
          () => null
        );
      }
    };
    const debounce = setTimeout(fetchSuggestions, 1000);
    return () => clearTimeout(debounce);
  }, [code, getAISuggestions, language]);

  useEffect(() => {
    if (awareness) {
      awareness.on("change", () => {
        const states = awareness.getStates();
        const cursors = Array.from(states.entries())
          .filter(
            ([clientId, state]) =>
              state.cursor && clientId !== awareness.clientID
          )
          .map(([clientId, state]) => ({
            clientId,
            cursor: state.cursor,
          }));

        if (editorRef.current && monacoRef.current) {
          editorRef.current.deltaDecorations(
            [],
            cursors.map((c) => ({
              range: new monacoRef.current!.Range(
                c.cursor.anchor.line,
                c.cursor.anchor.ch,
                c.cursor.head.line,
                c.cursor.head.ch
              ),
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
    <div
      className={`border rounded-lg overflow-hidden ${className}`}
      role="region"
      aria-label="Code Editor"
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <Editor
          height="100%"
          language={LANGUAGE_MAPPING[language] || "plaintext"}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            folding: true,
            foldingHighlight: true,
            foldingStrategy: "auto",
            showFoldingControls: "always",
            fontSize: 14,
            lineNumbers: "on",
            renderLineHighlight: "all",
            suggest: {
              showInlineDetails: true,
              showStatusBar: true,
            },
            accessibilitySupport: "on",
            renderValidationDecorations: "on",
          }}
        />
      )}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
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
                    aria-label="Keep Local Version"
                  >
                    Keep Local
                  </Button>
                  <Button
                    onClick={() =>
                      resolveConflict(index, conflict.remoteContent)
                    }
                    aria-label="Keep Remote Version"
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
