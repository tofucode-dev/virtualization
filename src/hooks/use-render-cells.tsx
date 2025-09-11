import { useCallback } from "react";

import {
  SizeFunction,
  UseRenderCellsReturn,
  VirtualizerProps,
  VisibleRange,
} from "../types/virtualization.types";
import { createCellStyle } from "../utils/virtualization-utils";

/**
 * Custom hook that renders cells based on the visible range.
 *
 * @param range - The visible range of cells
 * @param rowHeight - The height of each row
 * @param columnWidth - The width of each column
 * @param children - The function to render each cell
 */
export const useRenderCells = (
  range: VisibleRange,
  rowHeight: number | SizeFunction,
  columnWidth: number | SizeFunction,
  children: VirtualizerProps["children"]
): UseRenderCellsReturn => {
  return useCallback(() => {
    const cells: React.ReactNode[] = [];

    for (let rowIndex = range.firstRow; rowIndex <= range.lastRow; rowIndex++) {
      for (
        let columnIndex = range.firstColumn;
        columnIndex <= range.lastColumn;
        columnIndex++
      ) {
        // Use viewport-relative positioning to eliminate browser limits
        const style = createCellStyle(
          rowIndex,
          columnIndex,
          range.firstRow,
          range.firstColumn,
          rowHeight,
          columnWidth
        );
        const key = `${rowIndex}-${columnIndex}`;
        cells.push(
          children({ rowIndex, columnIndex, style, key })
        );
      }
    }

    return cells;
  }, [range, rowHeight, columnWidth, children]);
};
