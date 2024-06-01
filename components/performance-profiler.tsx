"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAI } from "@/hooks/use-ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, StopCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [selectedMetric, setSelectedMetric] = useState<
    "cpuUsage" | "memoryUsage" | "executionTime"
  >("cpuUsage");
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("line");
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
    const prompt = `Based on the following performance data, suggest optimizations for this code:

${JSON.stringify(performanceData)}

Code:
${code}`;
    const suggestions = await getAIResponse(prompt);
    setOptimizationSuggestions(suggestions);
  };

  const chartData = useMemo(() => {
    return performanceData.map((data) => ({
      ...data,
      timestamp: new Date(data.timestamp).toLocaleTimeString(),
    }));
  }, [performanceData]);

  const renderChart = () => {
    const ChartComponent =
      chartType === "line"
        ? LineChart
        : chartType === "area"
        ? AreaChart
        : BarChart;
    const DataComponent =
      chartType === "line" ? Line : chartType === "area" ? Area : Bar;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <DataComponent
            type="monotone"
            dataKey={selectedMetric}
            stroke="#8884d8"
            fill="#8884d8"
            name={
              selectedMetric === "cpuUsage"
                ? "CPU Usage (%)"
                : selectedMetric === "memoryUsage"
                ? "Memory Usage (MB)"
                : "Execution Time (ms)"
            }
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Performance Profiler
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Select
            value={selectedMetric}
            onValueChange={(
              value: "cpuUsage" | "memoryUsage" | "executionTime"
            ) => setSelectedMetric(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpuUsage">CPU Usage</SelectItem>
              <SelectItem value="memoryUsage">Memory Usage</SelectItem>
              <SelectItem value="executionTime">Execution Time</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={chartType}
            onValueChange={(value: "line" | "area" | "bar") =>
              setChartType(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={isProfileRunning ? stopProfiling : startProfiling}
            size="sm"
          >
            {isProfileRunning ? (
              <>
                <StopCircle className="mr-2 h-4 w-4" /> Stop Profiling
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Start Profiling
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow grid grid-rows-2 gap-4 p-4">
        <div className="w-full h-full">{renderChart()}</div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Optimization Suggestions</h3>
          <ScrollArea className="h-full border rounded p-2">
            <p className="text-sm">
              {optimizationSuggestions ||
                "Run the profiler to generate optimization suggestions."}
            </p>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
