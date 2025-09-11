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
        try {
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

          // Safely call the user's render function
          const cell = children({ rowIndex, columnIndex, style, key });
          cells.push(cell);
        } catch (error) {
          // If user's render function throws an error, render a fallback cell
          console.warn(
            `Error rendering cell at ${rowIndex}:${columnIndex}:`,
            error
          );
          const key = `${rowIndex}-${columnIndex}`;
          const fallbackStyle = createCellStyle(
            rowIndex,
            columnIndex,
            range.firstRow,
            range.firstColumn,
            rowHeight,
            columnWidth
          );

          cells.push(
            <div
              key={key}
              style={{
                ...fallbackStyle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ffebee",
                color: "#c62828",
                fontSize: "12px",
                border: "1px solid #ffcdd2",
              }}
            >
              Error
            </div>
          );
        }
      }
    }

    return cells;
  }, [range, rowHeight, columnWidth, children]);
};
