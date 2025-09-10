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
 *
 * @param containerHeight - The height of the container viewport
 * @param containerWidth - The width of the container viewport
 * @param numRows - The total number of rows in the grid
 * @param numColumns - The total number of columns in the grid
 * @param avgRowHeight - The average height of a row (for position calculations)
 * @param avgColumnWidth - The average width of a column (for position calculations)
 * @returns Visible range manager with current range, setter, and scroll handler
 */
export const useVisibleRange = (
  containerHeight: number,
  containerWidth: number,
  numRows: number,
  numColumns: number,
  avgRowHeight: number,
  avgColumnWidth: number
): VisibleRangeManager => {
  const [range, setRange] = useState<VisibleRange>(() => ({
    firstRow: 0,
    lastRow: Math.min(
      Math.floor(containerHeight / avgRowHeight) + 1,
      numRows - 1
    ),
    firstColumn: 0,
    lastColumn: Math.min(
      Math.floor(containerWidth / avgColumnWidth) + 1,
      numColumns - 1
    ),
  }));

  const onScroll = useCallback<React.UIEventHandler<HTMLDivElement>>(
    ({ currentTarget }) => {
      const { scrollTop, scrollLeft } = currentTarget;

      setRange({
        firstRow: Math.max(0, Math.floor(scrollTop / avgRowHeight)),
        lastRow: Math.min(
          numRows - 1,
          Math.floor((scrollTop + containerHeight) / avgRowHeight) + 1
        ),
        firstColumn: Math.max(0, Math.floor(scrollLeft / avgColumnWidth)),
        lastColumn: Math.min(
          numColumns - 1,
          Math.floor((scrollLeft + containerWidth) / avgColumnWidth) + 1
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
    ]
  );

  return {
    range,
    setRange,
    onScroll,
  };
};
