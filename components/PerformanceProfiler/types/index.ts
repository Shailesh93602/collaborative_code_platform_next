export interface PerformanceData {
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  executionTime: number;
}

export interface PerformanceProfilerProps {
  readonly code: string;
  readonly language: string;
  readonly dictionary: any;
}
