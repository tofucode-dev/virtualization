import { useEffect } from "react";

import styled from "styled-components";

import { useNumberParameter } from "../hooks/use-number-parameter";
import { VirtualizerFormProps } from "../types/virtualization.types";
import { TextField } from "./TextField";

const ParametersContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 8px;
  margin-bottom: 8px;
`;

export const VirtualizerForm = ({
  initialData,
  onParametersChange,
}: VirtualizerFormProps) => {
  const [numRowsInput, numRows, onChangeNumRows] = useNumberParameter(initialData.numRows);
  const [numColsInput, numCols, onChangeNumCols] = useNumberParameter(initialData.numCols);
  const [rowHeightInput, rowHeight, onChangeRowHeight] = useNumberParameter(initialData.rowHeight);
  const [columnWidthInput, columnWidth, onChangeColumnWidth] =
    useNumberParameter(initialData.columnWidth);
  const [containerHeightInput, containerHeight, onChangeContainerHeight] =
    useNumberParameter(initialData.containerHeight);
  const [containerWidthInput, containerWidth, onChangeContainerWidth] =
    useNumberParameter(initialData.containerWidth);
  const [overscanRowCountInput, overscanRowCount, onChangeOverscanRowCount] =
    useNumberParameter(initialData.overscanRowCount);
  const [
    overscanColumnCountInput,
    overscanColumnCount,
    onChangeOverscanColumnCount,
  ] = useNumberParameter(initialData.overscanColumnCount);

  useEffect(() => {
    onParametersChange({
      numRows,
      numCols,
      rowHeight,
      columnWidth,
      containerHeight,
      containerWidth,
      overscanRowCount,
      overscanColumnCount,
    });
  }, [
    numRows,
    numCols,
    rowHeight,
    columnWidth,
    containerHeight,
    containerWidth,
    overscanRowCount,
    overscanColumnCount,
    onParametersChange,
  ]);

  return (
    <ParametersContainer>
      <TextField
        label="Num Rows"
        value={numRowsInput}
        onChange={onChangeNumRows}
      />
      <TextField
        label="Num Columns"
        value={numColsInput}
        onChange={onChangeNumCols}
      />
      <TextField
        label="Row Height"
        value={rowHeightInput}
        onChange={onChangeRowHeight}
      />
      <TextField
        label="Column Width"
        value={columnWidthInput}
        onChange={onChangeColumnWidth}
      />
      <TextField
        label="Container Height"
        value={containerHeightInput}
        onChange={onChangeContainerHeight}
      />
      <TextField
        label="Container Width"
        value={containerWidthInput}
        onChange={onChangeContainerWidth}
      />
      <TextField
        label="Overscan Rows"
        value={overscanRowCountInput}
        onChange={onChangeOverscanRowCount}
      />
      <TextField
        label="Overscan Columns"
        value={overscanColumnCountInput}
        onChange={onChangeOverscanColumnCount}
      />
    </ParametersContainer>
  );
};
