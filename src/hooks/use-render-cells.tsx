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
        const style = createCellStyle(
          rowIndex,
          columnIndex,
          rowHeight,
          columnWidth
        );
        const key = `${rowIndex}-${columnIndex}`;
        cells.push(
          <div key={key}>{children({ rowIndex, columnIndex, style })}</div>
        );
      }
    }

    return cells;
  }, [range, rowHeight, columnWidth, children]);
};
