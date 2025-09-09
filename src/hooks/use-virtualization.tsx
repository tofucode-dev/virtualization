import { useCallback, useMemo, useState } from "react";

import type { VirtualizerProps } from "../types/virtualization.types";
import {
  calculateCumulativeSize,
  checkFunctionProp,
  checkNumberOrSizeFunctionProp,
  checkNumberProp,
  createCellStyle,
} from "../utils/virtualization-utils";

/**
 * Return type for the useVirtualization hook.
 */
interface UseVirtualizationReturn {
  onScroll: React.UIEventHandler<HTMLDivElement>;
  totalHeight: number;
  totalWidth: number;
  renderCells: () => JSX.Element[];
  containerHeight: number;
  containerWidth: number;
}

/**
 * Custom hook that manages virtualization logic for a grid component.
 *
 * This hook handles:
 * - Prop validation and normalization
 * - Total dimension calculations
 * - Visible range state management
 * - Scroll event handling
 * - Cell rendering optimization
 *
 * @param props - The virtualizer configuration props
 * @returns An object containing all necessary values and functions for virtualization
 *
 * @example
 * ```tsx
 * const { onScroll, totalHeight, totalWidth, renderCells } = useVirtualization({
 *   numRows: 1000,
 *   numColumns: 1000,
 *   rowHeight: 50,
 *   columnWidth: 100,
 *   containerHeight: 400,
 *   containerWidth: 400,
 *   children: ({ rowIndex, columnIndex, style }) => (
 *     <div style={style}>Cell {rowIndex}:{columnIndex}</div>
 *   )
 * });
 * ```
 */
// Can be split into smaller pieces for better readability, testing, maintanance i.e useVisibleRange, useScrollHandler, useRenderCells
export const useVirtualization = (
  props: VirtualizerProps
): UseVirtualizationReturn => {
  // 1. Validate and normalize props
  const numRows = checkNumberProp(props.numRows, 0);
  const numColumns = checkNumberProp(props.numColumns, 0);
  const rowHeight = checkNumberOrSizeFunctionProp(props.rowHeight, 0);
  const columnWidth = checkNumberOrSizeFunctionProp(props.columnWidth, 0);
  const containerHeight = checkNumberProp(props.containerHeight, 0);
  const containerWidth = checkNumberProp(props.containerWidth, 0);
  const children = checkFunctionProp(props.children, () => null);

  // 2. Memoized calculations for total dimensions
  const totalHeight = useMemo(
    () => calculateCumulativeSize(numRows, rowHeight),
    [numRows, rowHeight]
  );

  const totalWidth = useMemo(
    () => calculateCumulativeSize(numColumns, columnWidth),
    [numColumns, columnWidth]
  );

  // 3. Calculate average sizes for scroll position calculations
  const avgRowHeight = useMemo(
    () =>
      typeof rowHeight === "number"
        ? rowHeight
        : numRows > 0
          ? totalHeight / numRows
          : 0,
    [rowHeight, totalHeight, numRows]
  );

  const avgColumnWidth = useMemo(
    () =>
      typeof columnWidth === "number"
        ? columnWidth
        : numColumns > 0
          ? totalWidth / numColumns
          : 0,
    [columnWidth, totalWidth, numColumns]
  );

  // 4. State for tracking visible ranges
  const [firstVisibleRow, setFirstVisibleRow] = useState(() => 0);
  const [lastVisibleRow, setLastVisibleRow] = useState(() =>
    Math.min(Math.floor(containerHeight / avgRowHeight) + 1, numRows - 1)
  );
  const [firstVisibleColumn, setFirstVisibleColumn] = useState(() => 0);
  const [lastVisibleColumn, setLastVisibleColumn] = useState(() =>
    Math.min(Math.floor(containerWidth / avgColumnWidth) + 1, numColumns - 1)
  );

  // 5. Scroll handler to update visible ranges
  const onScroll = useCallback<React.UIEventHandler<HTMLDivElement>>(
    ({ currentTarget }) => {
      const { scrollTop, scrollLeft } = currentTarget;

      // Calculate new visible row range
      const newFirstRow = Math.max(0, Math.floor(scrollTop / avgRowHeight));
      const newLastRow = Math.min(
        numRows - 1,
        Math.floor((scrollTop + containerHeight) / avgRowHeight) + 1
      );

      // Calculate new visible column range
      const newFirstColumn = Math.max(
        0,
        Math.floor(scrollLeft / avgColumnWidth)
      );
      const newLastColumn = Math.min(
        numColumns - 1,
        Math.floor((scrollLeft + containerWidth) / avgColumnWidth) + 1
      );

      setFirstVisibleRow(newFirstRow);
      setLastVisibleRow(newLastRow);
      setFirstVisibleColumn(newFirstColumn);
      setLastVisibleColumn(newLastColumn);
    },
    [
      avgRowHeight,
      avgColumnWidth,
      containerHeight,
      containerWidth,
      numRows,
      numColumns,
    ]
  );

  // 6. Render function for visible cells
  const renderCells = useCallback(() => {
    const cells: JSX.Element[] = [];

    // Only render cells that are currently visible
    for (
      let rowIndex = firstVisibleRow;
      rowIndex <= lastVisibleRow;
      rowIndex++
    ) {
      for (
        let columnIndex = firstVisibleColumn;
        columnIndex <= lastVisibleColumn;
        columnIndex++
      ) {
        // Calculate positioning styles for this cell
        const style = createCellStyle(
          rowIndex,
          columnIndex,
          rowHeight,
          columnWidth
        );
        const key = `${rowIndex}-${columnIndex}`;

        // Render the cell with user-provided render function
        cells.push(
          <div key={key}>{children({ rowIndex, columnIndex, style })}</div>
        );
      }
    }

    return cells;
  }, [
    firstVisibleRow,
    lastVisibleRow,
    firstVisibleColumn,
    lastVisibleColumn,
    rowHeight,
    columnWidth,
    children,
  ]);

  return {
    onScroll,
    totalHeight,
    totalWidth,
    renderCells,
    containerHeight,
    containerWidth,
  };
};
