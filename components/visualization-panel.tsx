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

const generateRandomData = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    name: `Day ${i + 1}`,
    execTime: Math.random() * 100,
    memoryUsage: Math.random() * 1000,
  }));
};

export function VisualizationPanel() {
  const [data, setData] = useState(generateRandomData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateRandomData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-2xl font-semibold mb-4">Performance Visualization</h2>
      <LineChart width={500} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="execTime"
          stroke="#8884d8"
          name="Execution Time (ms)"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="memoryUsage"
          stroke="#82ca9d"
          name="Memory Usage (MB)"
        />
      </LineChart>
    </div>
  );
}
