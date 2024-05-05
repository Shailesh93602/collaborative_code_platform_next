"use client";

import { useState } from "react";
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

const generateRandomData = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    name: `Day ${i + 1}`,
    value1: Math.random() * 100,
    value2: Math.random() * 1000,
  }));
};

export function VisualizationStudio() {
  const [chartType, setChartType] = useState("line");
  const [data, setData] = useState(generateRandomData());
  const [customExpression, setCustomExpression] = useState("");

  const handleChartTypeChange = (value: string) => {
    setChartType(value);
    setData(generateRandomData());
  };

  const handleCustomVisualization = () => {
    try {
      const customData = eval(`data.map(item => (${customExpression}))`);
      setData(customData);
    } catch (error) {
      console.error("Invalid custom expression:", error);
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <LineChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value1" stroke="#8884d8" />
            <Line type="monotone" dataKey="value2" stroke="#82ca9d" />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value1" fill="#8884d8" />
            <Bar dataKey="value2" fill="#82ca9d" />
          </BarChart>
        );
      case "scatter":
        return (
          <ScatterChart width={500} height={300}>
            <CartesianGrid />
            <XAxis dataKey="value1" />
            <YAxis dataKey="value2" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter name="Values" data={data} fill="#8884d8" />
          </ScatterChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-2xl font-semibold mb-4">
        Interactive Visualization Studio
      </h2>
      <div className="flex space-x-4 mb-4">
        <Select onValueChange={handleChartTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="scatter">Scatter Plot</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Custom expression (e.g., {...item, value3: item.value1 * 2})"
          value={customExpression}
          onChange={(e) => setCustomExpression(e.target.value)}
        />
        <Button onClick={handleCustomVisualization}>Apply Custom</Button>
      </div>
      {renderChart()}
    </div>
  );
}
