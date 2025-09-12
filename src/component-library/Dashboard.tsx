import { useCallback, useState } from "react";

import styled from "styled-components";

import { usePerformanceMonitoring } from "../hooks/use-performance-monitoring";
import { CellInfo, VirtualizerFormData } from "../types/virtualization.types";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { Virtualizer } from "./Virtualizer";
import { VirtualizerForm } from "./VirtualizerForm";

const Container = styled.div`
  min-height: 100vh;
  min-width: 100vw;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const Dashboard = () => {
  const [formData, setFormData] = useState<VirtualizerFormData>({
    numRows: 5,
    numCols: 5,
    rowHeight: 50,
    columnWidth: 100,
    containerHeight: 400,
    containerWidth: 400,
    overscanRowCount: 1,
    overscanColumnCount: 1,
  });

  const handleParametersChange = useCallback((data: VirtualizerFormData) => {
    setFormData(data);
  }, []);

  const [reset, setReset] = useState(false);

  // Add performance monitoring
  const { metrics, startRender, endRender } = usePerformanceMonitoring();

  /**
   * Memoized render function for individual cells in the virtualized grid.
   *
   * This function creates alternating colored cells with row:column labels.
   * It's memoized to prevent unnecessary re-renders of the Virtualizer component.
   *
   * @param params - Cell information including indices and positioning styles
   * @returns A styled Cell component with alternating background colors
   */
  const renderCell = useCallback(
    ({ rowIndex, columnIndex, style, key }: CellInfo) => (
      <div
        key={key}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          backgroundColor:
            (rowIndex + (columnIndex % 2)) % 2 === 0 ? "aliceblue" : "white",
          ...style,
        }}
      >
        <span style={{ color: "black", fontSize: "14px" }}>
          {rowIndex}:{columnIndex}
        </span>
      </div>
    ),
    []
  );

  return (
    <Container>
      <h1>A Simple Virtualizer</h1>
      <button
        onClick={() => {
          setReset(prev => !prev);
        }}
      >
        {reset ? "!Force Render" : "Force Render!"}
      </button>
      <VirtualizerForm
        onParametersChange={handleParametersChange}
        initialData={formData}
      />
      <Virtualizer
        numRows={formData.numRows}
        numColumns={formData.numCols}
        rowHeight={formData.rowHeight}
        columnWidth={formData.columnWidth}
        containerHeight={formData.containerHeight}
        containerWidth={formData.containerWidth}
        overscanRowCount={formData.overscanRowCount}
        overscanColumnCount={formData.overscanColumnCount}
        onRenderStart={startRender}
        onRenderEnd={endRender}
      >
        {renderCell}
      </Virtualizer>

      <PerformanceMetrics
        numRows={formData.numRows}
        numColumns={formData.numCols}
        containerHeight={formData.containerHeight}
        containerWidth={formData.containerWidth}
        rowHeight={formData.rowHeight}
        columnWidth={formData.columnWidth}
        overscanRowCount={formData.overscanRowCount}
        overscanColumnCount={formData.overscanColumnCount}
        metrics={metrics}
      />
    </Container>
  );
};
