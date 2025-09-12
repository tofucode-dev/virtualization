import { useCallback, useRef, useState } from "react";

export interface PerformanceMetrics {
  renderTime: number;
  cellCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  renderCount: number;
}

export interface UsePerformanceMonitoringReturn {
  metrics: PerformanceMetrics;
  startRender: () => void;
  endRender: (cellCount: number) => void;
  reset: () => void;
}

/**
 * Hook for monitoring virtualization performance metrics
 */
export const usePerformanceMonitoring = (): UsePerformanceMonitoringReturn => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    cellCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    renderCount: 0,
  });

  const renderStartTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback((cellCount: number) => {
    const endTime = performance.now();
    const renderTime = endTime - renderStartTime.current;

    setMetrics(prev => {
      const newRenderTimes = [...renderTimes.current, renderTime];
      renderTimes.current = newRenderTimes;

      // Keep only last 50 render times for average calculation
      if (newRenderTimes.length > 50) {
        renderTimes.current = newRenderTimes.slice(-50);
      }

      const averageRenderTime =
        renderTimes.current.reduce((a, b) => a + b, 0) /
        renderTimes.current.length;

      return {
        renderTime,
        cellCount,
        lastRenderTime: renderTime,
        averageRenderTime,
        renderCount: prev.renderCount + 1,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setMetrics({
      renderTime: 0,
      cellCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      renderCount: 0,
    });
    renderTimes.current = [];
  }, []);

  return {
    metrics,
    startRender,
    endRender,
    reset,
  };
};
