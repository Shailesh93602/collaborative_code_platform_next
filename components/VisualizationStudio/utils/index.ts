import { DataPoint } from '../types';

export const generateRandomData = (count: number): DataPoint[] => {
  return Array.from({ length: count }, (_, i) => ({
    name: `Day ${i + 1}`,
    value1: Math.random() * 100,
    value2: Math.random() * 1000,
  }));
};
