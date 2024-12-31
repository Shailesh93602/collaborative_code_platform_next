'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateRandomData } from './utils';
import { VisualizationStudioProps } from './types';

export default function VisualizationStudio({ dictionary }: VisualizationStudioProps) {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'scatter'>('line');
  const [dataCount, setDataCount] = useState<number>(7);
  const [customExpression, setCustomExpression] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const data = useMemo(() => generateRandomData(dataCount), [dataCount]);

  const handleChartTypeChange = useCallback((value: 'line' | 'bar' | 'scatter') => {
    setChartType(value);
  }, []);

  const handleCustomVisualization = useCallback(() => {
    try {
      setError(null);
      // eslint-disable-next-line no-new-func
      const customDataFunction = new Function(
        'data',
        `return data.map(item => (${customExpression}))`
      );
      return customDataFunction(data);
    } catch (error) {
      console.error(dictionary?.customExpressionError, error);
      setError(dictionary?.invalidCustomExpression);
      return data;
    }
  }, [data, customExpression, dictionary]);

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
      case 'line':
        return (
          <LineChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value1" stroke="#8884d8" name={dictionary?.value1} />
            <Line type="monotone" dataKey="value2" stroke="#82ca9d" name={dictionary?.value2} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...props}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value1" fill="#8884d8" name={dictionary?.value1} />
            <Bar dataKey="value2" fill="#82ca9d" name={dictionary?.value2} />
          </BarChart>
        );
      case 'scatter':
        return (
          <ScatterChart {...props}>
            <CartesianGrid />
            <XAxis dataKey="value1" name={dictionary?.value1} />
            <YAxis dataKey="value2" name={dictionary?.value2} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name={dictionary?.values} data={chartData} fill="#8884d8" />
          </ScatterChart>
        );
      default:
        return <div>{dictionary?.noChartTypeSelected}</div>;
    }
  }, [chartType, chartData, dictionary]);

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-2xl font-semibold mb-4" id="visualization-title">
        {dictionary?.title}
      </h2>
      <div className="flex flex-wrap space-x-4 mb-4">
        <div>
          <Label htmlFor="chart-type">{dictionary?.chartTypeLabel}</Label>
          <Select onValueChange={handleChartTypeChange} value={chartType}>
            <SelectTrigger
              className="w-[180px]"
              id="chart-type"
              aria-label={dictionary?.selectChartType}
            >
              <SelectValue placeholder={dictionary?.selectChartType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">{dictionary?.lineChart}</SelectItem>
              <SelectItem value="bar">{dictionary?.barChart}</SelectItem>
              <SelectItem value="scatter">{dictionary?.scatterPlot}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="data-count">{dictionary?.dataCountLabel}</Label>
          <Input
            type="number"
            id="data-count"
            value={dataCount}
            onChange={(e) => setDataCount(parseInt(e.target.value) || 7)}
            placeholder={dictionary?.dataCountPlaceholder}
            className="w-[180px]"
            min="1"
            max="100"
          />
        </div>
        <div className="flex-grow">
          <Label htmlFor="custom-expression">{dictionary?.customExpressionLabel}</Label>
          <Input
            id="custom-expression"
            placeholder={dictionary?.customExpressionPlaceholder}
            value={customExpression}
            onChange={(e) => setCustomExpression(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      {error && (
        <Alert variant="default" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div aria-labelledby="visualization-title" role="img">
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
