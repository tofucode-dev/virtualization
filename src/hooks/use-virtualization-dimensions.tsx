import { useMemo } from "react";

import {
  SizeFunction,
  VirtualizationDimensions,
} from "../types/virtualization.types";
import { calculateCumulativeSize } from "../utils/virtualization-utils";

/**
 * Custom hook that calculates virtualization dimensions for a grid.
 *
 * Computes both total dimensions (for scroll container sizing) and average sizes
 * (for efficient scroll position calculations in virtualization).
 *
 * @param numRows - The number of rows in the grid
 * @param numColumns - The number of columns in the grid
 * @param rowHeight - The height of each row (fixed) or function to calculate height per row
 * @param columnWidth - The width of each column (fixed) or function to calculate width per column
 * @returns Virtualization dimensions including total height, total width, average row height, and average column width
 */
export const useVirtualizationDimensions = (
  numRows: number,
  numColumns: number,
  rowHeight: number | SizeFunction,
  columnWidth: number | SizeFunction
): VirtualizationDimensions => {
  const totalHeight = useMemo(
    () => calculateCumulativeSize(numRows, rowHeight),
    [numRows, rowHeight]
  );
  const totalWidth = useMemo(
    () => calculateCumulativeSize(numColumns, columnWidth),
    [numColumns, columnWidth]
  );

  const avgRowHeight = useMemo(() => {
    return typeof rowHeight === "number"
      ? numRows > 0
        ? rowHeight
        : 0
      : numRows > 0
        ? totalHeight / numRows
        : 0;
  }, [rowHeight, totalHeight, numRows]);

  const avgColumnWidth = useMemo(() => {
    return typeof columnWidth === "number"
      ? numColumns > 0
        ? columnWidth
        : 0
      : numColumns > 0
        ? totalWidth / numColumns
        : 0;
  }, [columnWidth, totalWidth, numColumns]);

  return {
    totalHeight,
    totalWidth,
    avgRowHeight,
    avgColumnWidth,
  };
};
