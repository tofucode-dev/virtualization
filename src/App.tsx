import React, { useCallback, useState } from "react";

import styled from "styled-components";

import { TextField } from "./TextField";
import { Virtualizer } from "./component-library";
import { CellInfo } from "./types/virtualization.types";

const Container = styled.div`
  min-height: 100vh;
  min-width: 100vw;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ParametersContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 8px;
  margin-bottom: 8px;
`;

const useNumberParameter = (
  initialValue: number
): [
  string,
  number,
  React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>,
] => {
  const [input, setInput] = useState(initialValue.toString());
  const [param, setParam] = useState(initialValue);
  const onChangeParam = useCallback<
    React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >(({ target: { value } }) => {
    if (/^\d*$/.test(value)) {
      setInput(value);
      if (value) {
        setParam(Number(value));
      }
    }
  }, []);

  return [input, param, onChangeParam];
};

const App = () => {
  const [numRowsInput, numRows, onChangeNumRows] = useNumberParameter(5);
  const [numColsInput, numCols, onChangeNumCols] = useNumberParameter(5);
  const [rowHeightInput, rowHeight, onChangeRowHeight] = useNumberParameter(50);
  const [columnWidthInput, columnWidth, onChangeColumnWidth] =
    useNumberParameter(100);
  const [containerHeightInput, containerHeight, onChangeContainerHeight] =
    useNumberParameter(400);
  const [containerWidthInput, containerWidth, onChangeContainerWidth] =
    useNumberParameter(400);
  const [overscanRowCountInput, overscanRowCount, onChangeOverscanRowCount] =
    useNumberParameter(1);
  const [
    overscanColumnCountInput,
    overscanColumnCount,
    onChangeOverscanColumnCount,
  ] = useNumberParameter(1);

  const [reset, setReset] = useState(false);

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
      <Virtualizer
        numRows={numRows}
        numColumns={numCols}
        rowHeight={rowHeight}
        columnWidth={columnWidth}
        containerHeight={containerHeight}
        containerWidth={containerWidth}
        overscanRowCount={overscanRowCount}
        overscanColumnCount={overscanColumnCount}
      >
        {renderCell}
      </Virtualizer>
    </Container>
  );
};

export default App;
