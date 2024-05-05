"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAI } from "@/hooks/use-ai";

interface PerformanceData {
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  executionTime: number;
}

export function PerformanceProfiler({ code }: { code: string }) {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState("");
  const [isProfileRunning, setIsProfileRunning] = useState(false);
  const { getAIResponse } = useAI();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProfileRunning) {
      interval = setInterval(() => {
        const newDataPoint: PerformanceData = {
          timestamp: Date.now(),
          cpuUsage: Math.random() * 100,
          memoryUsage: Math.random() * 1024,
          executionTime: Math.random() * 1000,
        };
        setPerformanceData((prevData) => [...prevData, newDataPoint]);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isProfileRunning]);

  const startProfiling = () => {
    setIsProfileRunning(true);
    setPerformanceData([]);
  };

  const stopProfiling = () => {
    setIsProfileRunning(false);
    generateOptimizationSuggestions();
  };

  const generateOptimizationSuggestions = async () => {
    const prompt = `Based on the following performance data, suggest optimizations for this code:\n\n${JSON.stringify(
      performanceData
    )}\n\nCode:\n${code}`;
    const suggestions = await getAIResponse(prompt);
    setOptimizationSuggestions(suggestions);
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h2 className="text-2xl font-semibold">Performance Profiler</h2>
      <div className="flex space-x-2">
        <Button onClick={startProfiling} disabled={isProfileRunning}>
          Start Profiling
        </Button>
        <Button onClick={stopProfiling} disabled={!isProfileRunning}>
          Stop Profiling
        </Button>
      </div>
      <LineChart width={600} height={300} data={performanceData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString()}
        />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip
          labelFormatter={(label) => new Date(label).toLocaleTimeString()}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="cpuUsage"
          stroke="#8884d8"
          name="CPU Usage (%)"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="memoryUsage"
          stroke="#82ca9d"
          name="Memory Usage (MB)"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="executionTime"
          stroke="#ffc658"
          name="Execution Time (ms)"
        />
      </LineChart>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Optimization Suggestions</h3>
        <ScrollArea className="h-[200px] border rounded p-2">
          {optimizationSuggestions ||
            "Run the profiler to generate optimization suggestions."}
        </ScrollArea>
      </div>
    </div>
  );
}
