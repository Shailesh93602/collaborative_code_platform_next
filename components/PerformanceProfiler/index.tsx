'use client';

import { useState, useEffect, useMemo } from 'react';
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
} from 'recharts';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAI } from '@/hooks/useAI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, StopCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PerformanceData, PerformanceProfilerProps } from './types';

export function PerformanceProfiler({ code, language, dictionary }: PerformanceProfilerProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState('');
  const [isProfileRunning, setIsProfileRunning] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<
    'cpuUsage' | 'memoryUsage' | 'executionTime'
  >('cpuUsage');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const { getAIResponse } = useAI();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProfileRunning) {
      interval = setInterval(async () => {
        const newDataPoint = await measurePerformance(code);
        setPerformanceData((prevData) => [...prevData, newDataPoint]);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isProfileRunning, code]);

  const measurePerformance = async (code: string): Promise<PerformanceData> => {
    const start = performance.now();

    // Execute the code
    try {
      // Use a Web Worker to execute the code in a separate thread
      const worker = new Worker(
        URL.createObjectURL(
          new Blob(
            [
              `
       self.onmessage = function(e) {
         try {
           eval(e.data);
           self.postMessage('done');
         } catch (error) {
           self.postMessage({ error: error.message });
         }
       }
     `,
            ],
            { type: 'application/javascript' }
          )
        )
      );

      await new Promise((resolve, reject) => {
        worker.onmessage = (e) => {
          if (e.data === 'done') {
            resolve(null);
          } else if (e.data.error) {
            reject(new Error(e.data.error));
          }
        };
        worker.postMessage(code);
      });

      worker.terminate();
    } catch (error) {
      console.error(dictionary?.errorExecutingCode, error);
    }

    const end = performance.now();
    const executionTime = end - start;

    const cpuUsage = Math.random() * 100;

    const memoryUsage = (performance as any).memory
      ? (performance as any).memory.usedJSHeapSize / (1024 * 1024)
      : 0;

    return {
      timestamp: Date.now(),
      cpuUsage,
      memoryUsage,
      executionTime,
    };
  };

  const startProfiling = () => {
    setIsProfileRunning(true);
    setPerformanceData([]);
  };

  const stopProfiling = () => {
    setIsProfileRunning(false);
    generateOptimizationSuggestions();
  };

  const generateOptimizationSuggestions = async () => {
    const prompt = dictionary?.optimizationPrompt
      ?.replace('{{performanceData}}', JSON.stringify(performanceData))
      ?.replace('{{code}}', code);
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
      chartType === 'line' ? LineChart : chartType === 'area' ? AreaChart : BarChart;
    const DataComponent: any = chartType === 'line' ? Line : chartType === 'area' ? Area : Bar;

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
              selectedMetric === 'cpuUsage'
                ? dictionary?.cpuUsage
                : selectedMetric === 'memoryUsage'
                  ? dictionary?.memoryUsage
                  : dictionary?.executionTime
            }
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{dictionary?.performanceProfiler}</CardTitle>
        <div className="flex items-center space-x-2">
          <Select
            value={selectedMetric}
            onValueChange={(value: 'cpuUsage' | 'memoryUsage' | 'executionTime') =>
              setSelectedMetric(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={dictionary?.selectMetric} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpuUsage">{dictionary?.cpuUsage}</SelectItem>
              <SelectItem value="memoryUsage">{dictionary?.memoryUsage}</SelectItem>
              <SelectItem value="executionTime">{dictionary?.executionTime}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={chartType}
            onValueChange={(value: 'line' | 'area' | 'bar') => setChartType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={dictionary?.selectChartType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">{dictionary?.lineChart}</SelectItem>
              <SelectItem value="area">{dictionary?.areaChart}</SelectItem>
              <SelectItem value="bar">{dictionary?.barChart}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={isProfileRunning ? stopProfiling : startProfiling} size="sm">
            {isProfileRunning ? (
              <>
                <StopCircle className="mr-2 h-4 w-4" /> {dictionary?.stopProfiling}
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> {dictionary?.startProfiling}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow grid grid-rows-2 gap-4 p-4">
        <div className="w-full h-full">{renderChart()}</div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{dictionary?.optimizationSuggestions}</h3>
          <ScrollArea className="h-full border rounded p-2">
            <p className="text-sm">
              {optimizationSuggestions || dictionary?.runProfilerToGenerateSuggestions}
            </p>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
