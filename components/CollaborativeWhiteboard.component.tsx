"use client";

import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCollaboration } from "@/hooks/useCollaboration.hook";
import { useToast } from "@/hooks/useToast.hook";

export function CollaborativeWhiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [codeSnippet, setCodeSnippet] = useState("");
  const { collaborativeEdit } = useCollaboration();
  const { toast } = useToast();

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
        width: 600,
        height: 400,
      });
      setFabricCanvas(canvas);

      const handleCollaborativeChanges = (objects: string) => {
        canvas.loadFromJSON(objects, () => canvas.renderAll());
      };

      collaborativeEdit("whiteboard", handleCollaborativeChanges);

      return () => {
        collaborativeEdit("whiteboard", null);
        canvas.dispose();
      };
    }
  }, [collaborativeEdit]);

  useEffect(() => {
    if (fabricCanvas?.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color =
        tool === "pen" ? "#000000" : "#ffffff";
      fabricCanvas.freeDrawingBrush.width = 5;
    }
  }, [tool, fabricCanvas]);

  const handleToolChange = (selectedTool: "pen" | "eraser") => {
    setTool(selectedTool);
  };

  const handleAddCode = () => {
    if (fabricCanvas && codeSnippet) {
      const text = new fabric.Text(codeSnippet, {
        left: 50,
        top: 50,
        fontSize: 16,
        fill: "#000000",
      });
      fabricCanvas.add(text);
      setCodeSnippet("");
      updateCollaborativeState();

      toast({
        title: "Code snippet added",
        description: "The code snippet has been added to the whiteboard.",
      });
    }
  };

  const updateCollaborativeState = () => {
    if (fabricCanvas) {
      const json = JSON.stringify(fabricCanvas.toJSON());
      collaborativeEdit("whiteboard", json);
    }
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
      <canvas ref={canvasRef} className="border" />
    </div>
  );
}
