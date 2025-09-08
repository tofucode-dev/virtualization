import React, { useCallback, useState } from "react";

/*
 type for the size of the rows and columns
*/
type DynamicSize = number | ((index: number) => number);

const calculateTotalSize = (size: DynamicSize, count: number) => {
  if (typeof size === "number") {
    return count * size;
  }

  // For dynamic sizes, sum up all individual sizes
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += size(i);
  }

  return total;
};


const checkNumberProp = (prop: unknown, fallback: number): number => {
  if (typeof prop === "number") {
    return prop;
  } else {
    return fallback;
  }
};

const checkNumberOrFunctionProp = (
  prop: any,
  fallback: number
): number | ((index: number) => number) => {
  if (typeof prop === "number" || typeof prop === "function") {
    return prop;
  } else {
    return fallback;
  }
};

const checkFunctionProp = (
  prop: any,
  fallback: () => null
): ((info: {
  rowIndex: number;
  columnIndex: number;
  style: React.CSSProperties;
}) => JSX.Element | null) => {
  if (typeof prop === "function") {
    return prop;
  } else {
    return fallback;
  }
};

export const Virtualizer = React.memo<{
  numRows: number;
  numColumns: number;
  rowHeight: number | ((index: number) => number);
  columnWidth: number | ((index: number) => number);
  containerHeight: number;
  containerWidth: number;
  children: (info: {
    rowIndex: number;
    columnIndex: number;
    style: React.CSSProperties;
  }) => JSX.Element | null;
}>(props => {
  const numRows = checkNumberProp(props.numRows, 0);
  const numColumns = checkNumberProp(props.numColumns, 0);
  const rowHeight = checkNumberOrFunctionProp(props.rowHeight, 0);
  const columnWidth = checkNumberOrFunctionProp(props.columnWidth, 0);
  const containerHeight = checkNumberProp(props.containerHeight, 0);
  const containerWidth = checkNumberProp(props.containerWidth, 0);
  const children = checkFunctionProp(props.children, () => null);

  const totalHeight = calculateTotalSize(rowHeight, numRows);
  const totalWidth = calculateTotalSize(columnWidth, numColumns);

  const [firstVisibleRow, setFirstVisibleRow] = useState(0);
  const [lastVisibleRow, setLastVisibleRow] = useState(0);
  const [firstVisibleColumn, setFirstVisibleColumn] = useState(0);
  const [lastVisibleColumn, setLastVisibleColumn] = useState(0);

  const onScroll = useCallback<React.UIEventHandler<HTMLDivElement>>(
    ({ currentTarget }) => {
      const { scrollTop, scrollLeft } = currentTarget;

      // Scroll calculations try to divide by functions instead of numbers (CRASHES!)
      // Calculate average sizes for scroll calculations
      const avgRowHeight =
        typeof rowHeight === "number" ? rowHeight : totalHeight / numRows;

      const avgColumnWidth =
        typeof columnWidth === "number" ? columnWidth : totalWidth / numColumns;

      setFirstVisibleRow(Math.floor(scrollTop / avgRowHeight));
      setLastVisibleRow(
        Math.floor((scrollTop + containerHeight) / avgRowHeight)
      );
      setFirstVisibleColumn(Math.floor(scrollLeft / avgColumnWidth));
      setLastVisibleColumn(
        Math.floor((scrollLeft + containerWidth) / avgColumnWidth)
      );
    },
    [
      rowHeight,
      columnWidth,
      totalHeight,
      totalWidth,
      numRows,
      numColumns,
      containerHeight,
      containerWidth,
    ]
  );

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
        {new Array(lastVisibleRow + 1 - firstVisibleRow)
          .fill(null)
          .map((_, y) =>
            new Array(lastVisibleColumn + 1 - firstVisibleColumn)
              .fill(null)
              .map((__, x) => {
                const rowIndex = firstVisibleRow + y;
                const columnIndex = firstVisibleColumn + x;

                // Bounds checking: ensure we don't render cells outside the grid
                if (rowIndex >= numRows || columnIndex >= numColumns) {
                  return null;
                }

                const style: React.CSSProperties = {
                  position: "absolute",
                  top:
                    typeof rowHeight === "number"
                      ? rowIndex * rowHeight
                      : new Array(rowIndex)
                          .fill(null)
                          .reduce<number>(
                            (acc, cur, index) => acc + rowHeight(index),
                            0
                          ),
                  left:
                    typeof columnWidth === "number"
                      ? columnIndex * columnWidth
                      : new Array(columnIndex)
                          .fill(null)
                          .reduce<number>(
                            (acc, cur, index) => acc + columnWidth(index),
                            0
                          ),
                  height:
                    typeof rowHeight === "number"
                      ? rowHeight
                      : rowHeight(rowIndex),
                  width:
                    typeof columnWidth === "number"
                      ? columnWidth
                      : columnWidth(columnIndex),
                };

                return children({ rowIndex, columnIndex, style });
              })
          )}
      </div>
    </div>
  );
});
