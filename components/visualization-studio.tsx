"use client";

import { useState, useMemo, useCallback } from "react";
import {
  LineChart,
  BarChart,
  ScatterChart,
  Line,
  Bar,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const generateRandomData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    name: `Day ${i + 1}`,
    value1: Math.random() * 100,
    value2: Math.random() * 1000,
  }));
};

export function VisualizationStudio() {
  const [chartType, setChartType] = useState("line");
  const [dataCount, setDataCount] = useState(7);
  const [customExpression, setCustomExpression] = useState("");

  const data = useMemo(() => generateRandomData(dataCount), [dataCount]);

  const handleChartTypeChange = useCallback((value: string) => {
    setChartType(value);
  }, []);

  const handleCustomVisualization = useCallback(() => {
    try {
      const customData = eval(`data.map(item => (${customExpression}))`);
      return customData;
    } catch (error) {
      console.error("Invalid custom expression:", error);
      return data;
    }
  }, [data, customExpression]);

  const chartData = useMemo(() => {
    return customExpression ? handleCustomVisualization() : data;
  }, [data, customExpression, handleCustomVisualization]);

  const renderChart = useCallback(() => {
    const props = {
      width: 500,
      height: 300,
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value1"
              stroke="#8884d8"
              name="Value 1"
            />
            <Line
              type="monotone"
              dataKey="value2"
              stroke="#82ca9d"
              name="Value 2"
            />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value1" fill="#8884d8" name="Value 1" />
            <Bar dataKey="value2" fill="#82ca9d" name="Value 2" />
          </BarChart>
        );
      case "scatter":
        return (
          <ScatterChart {...props}>
            <CartesianGrid />
            <XAxis dataKey="value1" name="Value 1" />
            <YAxis dataKey="value2" name="Value 2" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter name="Values" data={chartData} fill="#8884d8" />
          </ScatterChart>
        );
      default:
        return null;
    }
  }, [chartType, chartData]);

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-2xl font-semibold mb-4" id="visualization-title">
        Interactive Visualization Studio
      </h2>
      <div className="flex flex-wrap space-x-4 mb-4">
        <div>
          <Label htmlFor="chart-type">Chart Type</Label>
          <Select onValueChange={handleChartTypeChange} value={chartType}>
            <SelectTrigger
              className="w-[180px]"
              id="chart-type"
              aria-label="Select chart type"
            >
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="scatter">Scatter Plot</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="data-count">Number of Data Points</Label>
          <Input
            type="number"
            id="data-count"
            value={dataCount}
            onChange={(e) => setDataCount(parseInt(e.target.value) || 7)}
            placeholder="Number of data points"
            className="w-[180px]"
            min="1"
            max="100"
          />
        </div>
        <div className="flex-grow">
          <Label htmlFor="custom-expression">Custom Expression</Label>
          <Input
            id="custom-expression"
            placeholder="Custom expression (e.g., {...item, value3: item.value1 * 2})"
            value={customExpression}
            onChange={(e) => setCustomExpression(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      <div aria-labelledby="visualization-title" role="img">
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
