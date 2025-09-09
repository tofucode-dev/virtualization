import React, { useCallback, useState } from "react";

// typeguards
const isSizeFunction = (fn: unknown): fn is SizeFunction => {
  return typeof fn === "function" && fn.length === 1; // This check would be enough for our use case
  // for other use cases i.e checking between two different functions with same amount of parameters, might need to add more checks like branded types
};
const isRenderFunction = (fn: unknown): fn is RenderFunction => {
  return typeof fn === "function" && fn.length === 1;
};

//TYPES
interface SizeFunction {
  (index: number): number;
}

interface RenderFunction {
  (info: CellInfo): JSX.Element | null; // Can be replaced with React.ReactNode for better React type compatibility
}

interface CellInfo {
  rowIndex: number;
  columnIndex: number;
  style: React.CSSProperties;
}

interface VirtualizerProps {
  numRows: number;
  numColumns: number;
  rowHeight: number | SizeFunction;
  columnWidth: number | SizeFunction;
  containerHeight: number;
  containerWidth: number;
  children: RenderFunction;
}

//HELPER FUNCTIONS
const checkNumberProp = (prop: unknown, fallback: number): number => {
  if (typeof prop === "number" && !isNaN(prop) && isFinite(prop)) {
    return prop;
  }

  return fallback;
};

const calculateCumulativeSize = (
  count: number,
  size: number | SizeFunction,
  startIndex: number = 0
): number => {
  if (typeof size === "number") {
    return count * size;
  }

  return new Array(count)
    .fill(null)
    .reduce<number>((acc, _, index) => acc + size(startIndex + index), 0);
};

const createCellStyle = (
  rowIndex: number,
  columnIndex: number,
  rowHeight: number | SizeFunction,
  columnWidth: number | SizeFunction
): React.CSSProperties => {
  const top = calculateCumulativeSize(rowIndex, rowHeight);
  const left = calculateCumulativeSize(columnIndex, columnWidth);

  const height =
    typeof rowHeight === "number" ? rowHeight : rowHeight(rowIndex);
  const width =
    typeof columnWidth === "number" ? columnWidth : columnWidth(columnIndex);

  return {
    position: "absolute",
    top,
    left,
    height,
    width,
  };
};

const checkNumberOrSizeFunctionProp = (
  prop: unknown,
  fallback: number
): number | SizeFunction => {
  if (typeof prop === "number" && !isNaN(prop) && isFinite(prop)) {
    return prop;
  }
  if (isSizeFunction(prop)) {
    return prop;
  }

  return fallback;
};

const checkFunctionProp = (
  prop: unknown,
  fallback: () => null
): RenderFunction => {
  if (isRenderFunction(prop)) {
    return prop;
  } else {
    return fallback;
  }
};

export const Virtualizer = React.memo<VirtualizerProps>(props => {
  const numRows = checkNumberProp(props.numRows, 0);
  const numColumns = checkNumberProp(props.numColumns, 0);
  const rowHeight = checkNumberOrSizeFunctionProp(props.rowHeight, 0);
  const columnWidth = checkNumberOrSizeFunctionProp(props.columnWidth, 0);
  const containerHeight = checkNumberProp(props.containerHeight, 0);
  const containerWidth = checkNumberProp(props.containerWidth, 0);
  const children = checkFunctionProp(props.children, () => null);

  const totalHeight = calculateCumulativeSize(numRows, rowHeight);
  const totalWidth = calculateCumulativeSize(numColumns, columnWidth);

  // Calculate initial visible range
  const avgRowHeight =
    typeof rowHeight === "number" ? rowHeight : totalHeight / numRows;
  const avgColumnWidth =
    typeof columnWidth === "number" ? columnWidth : totalWidth / numColumns;

  const [firstVisibleRow, setFirstVisibleRow] = useState(() => 0);
  const [lastVisibleRow, setLastVisibleRow] = useState(() =>
    Math.min(Math.floor(containerHeight / avgRowHeight) + 1, numRows - 1)
  );
  const [firstVisibleColumn, setFirstVisibleColumn] = useState(() => 0);
  const [lastVisibleColumn, setLastVisibleColumn] = useState(() =>
    Math.min(Math.floor(containerWidth / avgColumnWidth) + 1, numColumns - 1)
  );

  const onScroll = useCallback<React.UIEventHandler<HTMLDivElement>>(
    ({ currentTarget }) => {
      const { scrollTop, scrollLeft } = currentTarget;

      setFirstVisibleRow(Math.floor(scrollTop / avgRowHeight));
      setLastVisibleRow(
        Math.floor((scrollTop + containerHeight) / avgRowHeight)
      );
      setFirstVisibleColumn(Math.floor(scrollLeft / avgColumnWidth));
      setLastVisibleColumn(
        Math.floor((scrollLeft + containerWidth) / avgColumnWidth)
      );
    },
    [avgRowHeight, avgColumnWidth, containerHeight, containerWidth]
  );

  const renderCells = () => {
    return new Array(lastVisibleRow + 1 - firstVisibleRow).fill(null).map((_, y) =>
      new Array(lastVisibleColumn + 1 - firstVisibleColumn)
        .fill(null)
        .map((__, x) => {
          const rowIndex = firstVisibleRow + y;
          const columnIndex = firstVisibleColumn + x;
          const style = createCellStyle(
            rowIndex,
            columnIndex,
            rowHeight,
            columnWidth
          );

          return children({ rowIndex, columnIndex, style });
        })
    );
  };

  return (
    <div
      style={{
        height: containerHeight,
        width: containerWidth,
        overflow: "auto",
      }}
      onScroll={onScroll}
    >
      <div
        style={{
          position: "relative",
          height: totalHeight,
          width: totalWidth,
          overflow: "hidden",
        }}
      >
        {renderCells()}
      </div>
    </div>
  );
});
