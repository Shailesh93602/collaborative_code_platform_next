"use client";

import React, { useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";

export default function CodeEditor() {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    console.log("Editor mounted:", editor);
    console.log("Monaco instance:", monaco);
  };

  return (
    <Editor
      height="80vh"
      defaultLanguage="javascript"
      defaultValue="// Start coding here!"
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        tabSize: 2,
        automaticLayout: true,
      }}
    />
  );
}
