import React, { useCallback, useState } from "react";

import styled from "styled-components";

import { TextField } from "./TextField";
import { Virtualizer } from "./component-library";

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

const Cell = styled(
  React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & { backgroundColor: string }
  >(({ backgroundColor, ...props }, ref) => <div ref={ref} {...props} />)
)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: ${({ backgroundColor }) => backgroundColor};
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

  return (
    <Container>
      <h1>A Simple Virtualizer</h1>
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
      </ParametersContainer>
      <Virtualizer
        numRows={numRows}
        numColumns={numCols}
        rowHeight={rowHeight}
        columnWidth={columnWidth}
        containerHeight={containerHeight}
        containerWidth={containerWidth}
      >
        {({ rowIndex, columnIndex, style }) => (
          <Cell
            key={`${rowIndex}-${columnIndex}`}
            style={style}
            backgroundColor={
              (rowIndex + (columnIndex % 2)) % 2 === 0 ? "aliceblue" : "white"
            }
          >
            <p>
              {rowIndex}:{columnIndex}
            </p>
          </Cell>
        )}
      </Virtualizer>
    </Container>
  );
};

export default App;
