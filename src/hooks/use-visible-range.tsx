import { useCallback, useState } from "react";

import {
  VisibleRange,
  VisibleRangeManager,
} from "../types/virtualization.types";

/**
 * Custom hook that manages the visible range of cells in the virtualized grid.
 *
 * Calculates which rows and columns are currently visible based on scroll position
 * and provides optimized scroll handling to update the visible range efficiently.
 * Includes overscan support for smoother scrolling by rendering extra cells outside the viewport.
 *
 * @param containerHeight - The height of the container viewport
 * @param containerWidth - The width of the container viewport
 * @param numRows - The total number of rows in the grid
 * @param numColumns - The total number of columns in the grid
 * @param avgRowHeight - The average height of a row (for position calculations)
 * @param avgColumnWidth - The average width of a column (for position calculations)
 * @param overscanRowCount - Number of extra rows to render outside the visible area
 * @param overscanColumnCount - Number of extra columns to render outside the visible area
 * @returns Visible range manager with current range, setter, and scroll handler
 */
export const useVisibleRange = (
  containerHeight: number,
  containerWidth: number,
  numRows: number,
  numColumns: number,
  avgRowHeight: number,
  avgColumnWidth: number,
  overscanRowCount: number,
  overscanColumnCount: number
): VisibleRangeManager => {
  const [range, setRange] = useState<VisibleRange>(() => {
    const visibleRows = Math.floor(containerHeight / avgRowHeight) + 1;
    const visibleColumns = Math.floor(containerWidth / avgColumnWidth) + 1;

    return {
      firstRow: Math.max(0, 0 - overscanRowCount),
      lastRow: Math.min(numRows - 1, visibleRows - 1 + overscanRowCount),
      firstColumn: Math.max(0, 0 - overscanColumnCount),
      lastColumn: Math.min(
        numColumns - 1,
        visibleColumns - 1 + overscanColumnCount
      ),
    };
  });

  const onScroll = useCallback<React.UIEventHandler<HTMLDivElement>>(
    ({ currentTarget }) => {
      const { scrollTop, scrollLeft } = currentTarget;

      // Calculate visible range
      const firstVisibleRow = Math.floor(scrollTop / avgRowHeight);
      const lastVisibleRow = Math.floor(
        (scrollTop + containerHeight) / avgRowHeight
      );
      const firstVisibleColumn = Math.floor(scrollLeft / avgColumnWidth);
      const lastVisibleColumn = Math.floor(
        (scrollLeft + containerWidth) / avgColumnWidth
      );

      // Apply overscan
      setRange({
        firstRow: Math.max(0, firstVisibleRow - overscanRowCount),
        lastRow: Math.min(numRows - 1, lastVisibleRow + overscanRowCount),
        firstColumn: Math.max(0, firstVisibleColumn - overscanColumnCount),
        lastColumn: Math.min(
          numColumns - 1,
          lastVisibleColumn + overscanColumnCount
        ),
      });
    },
    [
      avgRowHeight,
      avgColumnWidth,
      containerHeight,
      containerWidth,
      numRows,
      numColumns,
      overscanRowCount,
      overscanColumnCount,
    ]
  );

  return {
    range,
    setRange,
    onScroll,
  };
};
