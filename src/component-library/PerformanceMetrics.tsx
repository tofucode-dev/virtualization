import React from "react";

import styled from "styled-components";

import { PerformanceMetrics as PerformanceMetricsType } from "../hooks/use-performance-monitoring";

interface PerformanceMetricsProps {
  numRows: number;
  numColumns: number;
  containerHeight: number;
  containerWidth: number;
  rowHeight: number;
  columnWidth: number;
  overscanRowCount: number;
  overscanColumnCount: number;
  metrics: PerformanceMetricsType;
}

const MetricsContainer = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  min-width: 200px;
  z-index: 1000;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const MetricLabel = styled.span`
  color: #ccc;
`;

const MetricValue = styled.span<{ warning?: boolean }>`
  color: ${props => (props.warning ? "#ff6b6b" : "#4ecdc4")};
  font-weight: bold;
`;

const StatusIndicator = styled.div<{ status: "good" | "warning" | "poor" }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props =>
    props.status === "good"
      ? "#4ecdc4"
      : props.status === "warning"
        ? "#ffa726"
        : "#ff6b6b"};
  display: inline-block;
  margin-right: 6px;
`;

export const PerformanceMetrics = React.memo<PerformanceMetricsProps>(({
  numRows,
  numColumns,
  containerHeight,
  containerWidth,
  rowHeight,
  columnWidth,
  overscanRowCount,
  overscanColumnCount,
  metrics,
}) => {

  // Calculate visible area
  const visibleRows =
    Math.ceil(containerHeight / rowHeight) + overscanRowCount * 2;
  const visibleColumns =
    Math.ceil(containerWidth / columnWidth) + overscanColumnCount * 2;
  // Calculate virtualization efficiency - how many cells we're NOT rendering
  const totalCells = numRows * numColumns;
  const expectedCellCount = Math.min(visibleRows * visibleColumns, totalCells);
  const virtualizationEfficiency =
    totalCells > 0
      ? Math.max(0, ((totalCells - expectedCellCount) / totalCells) * 100)
      : 0;

  const getPerformanceStatus = (): "good" | "warning" | "poor" => {
    if (metrics.lastRenderTime > 10 || virtualizationEfficiency < 50) {
      return "poor";
    }
    if (metrics.lastRenderTime > 5 || virtualizationEfficiency < 80) {
      return "warning";
    }

    return "good";
  };

  const status = getPerformanceStatus();

  return (
    <MetricsContainer>
      <div
        style={{ marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}
      >
        <StatusIndicator status={status} />
        Performance Metrics
      </div>

      <MetricRow>
        <MetricLabel>Last Render:</MetricLabel>
        <MetricValue warning={metrics.lastRenderTime > 5}>
          {metrics.lastRenderTime.toFixed(1)}ms
        </MetricValue>
      </MetricRow>

      <MetricRow>
        <MetricLabel>Avg Render:</MetricLabel>
        <MetricValue warning={metrics.averageRenderTime > 5}>
          {metrics.averageRenderTime.toFixed(1)}ms
        </MetricValue>
      </MetricRow>

      <MetricRow>
        <MetricLabel>Rendered Cells:</MetricLabel>
        <MetricValue warning={metrics.cellCount > 500}>
          {metrics.cellCount.toLocaleString()}
        </MetricValue>
      </MetricRow>

      <MetricRow>
        <MetricLabel>Visible Area:</MetricLabel>
        <MetricValue>
          {Math.min(visibleRows, numRows)}×
          {Math.min(visibleColumns, numColumns)}
        </MetricValue>
      </MetricRow>

      <MetricRow>
        <MetricLabel>Total Cells:</MetricLabel>
        <MetricValue>{totalCells.toLocaleString()}</MetricValue>
      </MetricRow>

      <MetricRow>
        <MetricLabel>Virtualization:</MetricLabel>
        <MetricValue warning={virtualizationEfficiency < 80}>
          {virtualizationEfficiency.toFixed(1)}%
        </MetricValue>
      </MetricRow>

      <MetricRow>
        <MetricLabel>Render Count:</MetricLabel>
        <MetricValue>{metrics.renderCount}</MetricValue>
      </MetricRow>

      <div
        style={{
          marginTop: "8px",
          fontSize: "10px",
          color: "#888",
          borderTop: "1px solid #333",
          paddingTop: "4px",
        }}
      >
        Real-time monitoring
      </div>
    </MetricsContainer>
  );
});
