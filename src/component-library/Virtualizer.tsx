import React, { useCallback, useState } from "react";

const checkNumberProp = (prop: any, fallback: number): number => {
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

  const totalHeight =
    typeof rowHeight === "number"
      ? numRows * rowHeight
      : new Array(numRows)
          .fill(null)
          .reduce<number>((acc, _, index) => acc + rowHeight(index), 0);

  const totalWidth =
    typeof columnWidth === "number"
      ? numColumns * columnWidth
      : new Array(numColumns)
          .fill(null)
          .reduce<number>((acc, _, index) => acc + columnWidth(index), 0);

  // Calculate initial visible range
  const avgRowHeight =
    typeof rowHeight === "number" ? rowHeight : totalHeight / numRows;
  const avgColumnWidth =
    typeof columnWidth === "number" ? columnWidth : totalWidth / numColumns;

  const initialFirstVisibleRow = 0;
  const initialLastVisibleRow = Math.min(
    Math.floor(containerHeight / avgRowHeight) + 1,
    numRows - 1
  );
  const initialFirstVisibleColumn = 0;
  const initialLastVisibleColumn = Math.min(
    Math.floor(containerWidth / avgColumnWidth) + 1,
    numColumns - 1
  );

  const [firstVisibleRow, setFirstVisibleRow] = useState(
    initialFirstVisibleRow
  );
  const [lastVisibleRow, setLastVisibleRow] = useState(initialLastVisibleRow);
  const [firstVisibleColumn, setFirstVisibleColumn] = useState(
    initialFirstVisibleColumn
  );
  const [lastVisibleColumn, setLastVisibleColumn] = useState(
    initialLastVisibleColumn
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
