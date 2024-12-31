'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, Path, Text } from 'fabric';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/useToast.hook';
import io, { Socket } from 'socket.io-client';
import { debounce } from 'lodash';
import { CollaborativeWhiteboardProps, WhiteboardObject } from './types';

export default function CollaborativeWhiteboard({
  roomId,
  dictionary,
}: CollaborativeWhiteboardProps) {
  const canvasRef = useRef<Canvas | null>(null);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'text'>('pen');
  const [color, setColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(5);
  const [codeSnippet, setCodeSnippet] = useState('');
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const canvas = new Canvas('whiteboard', {
      isDrawingMode: true,
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    canvasRef.current = canvas;

    socketRef.current = io('http://localhost:3001');

    socketRef.current.on('canvas-update', (updatedObjects: WhiteboardObject[]) => {
      canvas.clear();
      updatedObjects.forEach((obj) => {
        let fabricObject;
        switch (obj.type) {
          case 'path':
            fabricObject = new Path(obj.options.path as string, obj.options as any);
            break;
          case 'text':
            fabricObject = new Text(obj.options.text as string, obj.options as any);
            break;
        }
        if (fabricObject) {
          canvas.add(fabricObject);
        }
      });
      canvas.renderAll();
    });

    return () => {
      canvas.dispose();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const emitCanvasUpdate = useCallback(
    debounce(() => {
      if (canvasRef.current && socketRef.current) {
        const objects = canvasRef.current.getObjects().map((obj) => ({
          type: obj.type,
          options: obj.toObject(),
        }));
        socketRef.current.emit('canvas-update', objects);
      }
    }, 100),
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.on('object:added', emitCanvasUpdate);
      canvas.on('object:modified', emitCanvasUpdate);
      canvas.on('object:removed', emitCanvasUpdate);
    }

    return () => {
      if (canvas) {
        canvas.off('object:added', emitCanvasUpdate);
        canvas.off('object:modified', emitCanvasUpdate);
        canvas.off('object:removed', emitCanvasUpdate);
      }
    };
  }, [emitCanvasUpdate]);

  const handleToolChange = (selectedTool: 'pen' | 'eraser' | 'text') => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    setTool(selectedTool);

    switch (selectedTool) {
      case 'pen':
        canvas.isDrawingMode = true;
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = color;
          canvas.freeDrawingBrush.width = brushSize;
        }
        break;
      case 'eraser':
        canvas.isDrawingMode = true;
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = '#ffffff';
          canvas.freeDrawingBrush.width = brushSize * 2;
        }
        break;
      case 'text':
        canvas.isDrawingMode = false;
        break;
    }
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (canvasRef.current?.freeDrawingBrush) {
      canvasRef.current.freeDrawingBrush.color = newColor;
    }
  };

  const handleBrushSizeChange = (newSize: number) => {
    setBrushSize(newSize);
    if (canvasRef.current?.freeDrawingBrush) {
      canvasRef.current.freeDrawingBrush.width = newSize;
    }
  };

  // const handleAddText = () => {
  //   if (!canvasRef.current) return;
  //   const canvas = canvasRef.current;
  //   const text = new Text('Type here', {
  //     left: 100,
  //     top: 100,
  //     fontSize: 20,
  //     fill: color,
  //   });
  //   canvas.add(text);
  //   canvas.setActiveObject(text);
  //   emitCanvasUpdate();
  // };

  const handleAddCode = () => {
    if (!canvasRef.current || !codeSnippet) return;
    const canvas = canvasRef.current;
    const text = new Text(codeSnippet, {
      left: 50,
      top: 50,
      fontSize: 14,
      fontFamily: 'Courier New',
      fill: color,
    });
    canvas.add(text);
    setCodeSnippet('');
    emitCanvasUpdate();

    toast({
      title: dictionary?.codeSnippetAdded,
      description: dictionary?.codeSnippetAddedDescription,
    });
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h2 className="text-2xl font-semibold">{dictionary?.collaborativeWhiteboard}</h2>
      <div className="flex space-x-2">
        <Button
          onClick={() => handleToolChange('pen')}
          variant={tool === 'pen' ? 'default' : 'outline'}
        >
          {dictionary?.pen}
        </Button>
        <Button
          onClick={() => handleToolChange('eraser')}
          variant={tool === 'eraser' ? 'default' : 'outline'}
        >
          {dictionary?.eraser}
        </Button>
        <Button
          onClick={() => handleToolChange('text')}
          variant={tool === 'text' ? 'default' : 'outline'}
        >
          {dictionary?.text}
        </Button>
        <Input
          type="color"
          value={color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-12"
        />
        <Input
          type="number"
          value={brushSize}
          onChange={(e) => handleBrushSizeChange(Number(e.target.value))}
          min="1"
          max="50"
          className="w-20"
        />
      </div>
      <div className="flex space-x-2">
        <Input
          value={codeSnippet}
          onChange={(e) => setCodeSnippet(e.target.value)}
          placeholder={dictionary?.enterCodeSnippet}
        />
        <Button onClick={handleAddCode}>{dictionary?.addCode}</Button>
      </div>
      <canvas id="whiteboard" width={800} height={600} className="border" />
    </div>
  );
}
