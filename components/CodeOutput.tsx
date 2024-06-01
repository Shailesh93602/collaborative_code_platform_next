import React from "react";

interface CodeOutputProps {
  output: string;
}

export function CodeOutput({ output }: CodeOutputProps) {
  return (
    <div className="bg-gray-800 text-white p-4 rounded-md">
      <pre>{output}</pre>
    </div>
  );
}
