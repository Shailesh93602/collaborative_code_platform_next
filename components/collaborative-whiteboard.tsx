"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, Text } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCollaboration } from "@/hooks/use-collaboration";
import { useToast } from "@/hooks/use-toast";

export function CollaborativeWhiteboard() {
  const canvasRef = useRef<Canvas | null>(null);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [codeSnippet, setCodeSnippet] = useState("");
  const { collaborativeEdit } = useCollaboration();
  const { toast } = useToast();

  useEffect(() => {
    const canvas = new Canvas("whiteboard", {
      isDrawingMode: true,
      backgroundColor: "#ffffff",
    });

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = "#000000";
      canvas.freeDrawingBrush.width = 5;
    }
    canvasRef.current = canvas;

    const handleCollaborativeChanges = (objects: any) => {
      canvas.clear();
      canvas.loadFromJSON(objects, () => canvas.renderAll());
    };

    collaborativeEdit("whiteboard", handleCollaborativeChanges);

    return () => {
      collaborativeEdit("whiteboard", null);
      canvas.dispose();
    };
  }, [collaborativeEdit]);

  const handleToolChange = (selectedTool: "pen" | "eraser") => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    setTool(selectedTool);

    if (selectedTool === "pen") {
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = "#000000";
      }
    } else if (selectedTool === "eraser") {
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = "#ffffff";
      }
    }
  };

  const handleAddCode = () => {
    if (!canvasRef.current || !codeSnippet) return;

    const canvas = canvasRef.current;
    const text = new Text(codeSnippet, {
      left: 50,
      top: 50,
      fontSize: 16,
      fill: "#000000",
      selectable: true,
    });

    canvas.add(text);
    setCodeSnippet("");
    collaborativeEdit("whiteboard", canvas.toJSON());

    toast({
      title: "Code snippet added",
      description: "The code snippet has been added to the whiteboard.",
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h2 className="text-2xl font-semibold">Collaborative Whiteboard</h2>
      <div className="flex space-x-2">
        <Button
          onClick={() => handleToolChange("pen")}
          variant={tool === "pen" ? "default" : "outline"}
        >
          Pen
        </Button>
        <Button
          onClick={() => handleToolChange("eraser")}
          variant={tool === "eraser" ? "default" : "outline"}
        >
          Eraser
        </Button>
      </div>
      <div className="flex space-x-2">
        <Input
          value={codeSnippet}
          onChange={(e) => setCodeSnippet(e.target.value)}
          placeholder="Enter code snippet"
        />
        <Button onClick={handleAddCode}>Add Code</Button>
      </div>
      <canvas id="whiteboard" width={600} height={400} className="border" />
    </div>
  );
}
