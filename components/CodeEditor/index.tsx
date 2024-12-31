'use client';
import React from 'react';
import { Editor } from '@monaco-editor/react';
import { CodeEditorProps } from './types';

export default function CodeEditor({ value, onChange, language, dictionary }: CodeEditorProps) {
  return (
    <div className="relative h-full">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(value) => onChange(value ?? '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          automaticLayout: true,
        }}
        aria-label={dictionary?.ariaLabel}
      />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 bg-primary text-primary-foreground rounded"
          onClick={() => console.log('Run code')}
        >
          {dictionary?.run}
        </button>
        <button
          className="px-2 py-1 bg-secondary text-secondary-foreground rounded"
          onClick={() => console.log('Save code')}
        >
          {dictionary?.save}
        </button>
      </div>
    </div>
  );
}
