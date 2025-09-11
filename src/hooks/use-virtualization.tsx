import type {
  UseVirtualizationReturn,
  VirtualizerProps,
} from "../types/virtualization.types";
import { useRenderCells } from "./use-render-cells";
import { useValidatedProps } from "./use-validate-props";
import { useVirtualizationDimensions } from "./use-virtualization-dimensions";
import { useVisibleRange } from "./use-visible-range";

/**
 * Main virtualization hook that orchestrates all virtualization concerns.
 *
 * This hook composes smaller, focused hooks to provide a clean API:
 * - useValidatedProps: Validates and normalizes input props
 * - useVirtualizationDimensions: Calculates total and average dimensions
 * - useVisibleRange: Manages visible row/column state and scroll handling
 * - useRenderCells: Renders only visible cells efficiently
 *
 * This composition approach provides:
 * - Better testability (each concern can be tested in isolation)
 * - Better maintainability (single responsibility per hook)
 * - Better reusability (individual hooks can be used elsewhere)
 * - Better performance (fine-grained memoization)
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
export const useVirtualization = (
  props: VirtualizerProps
): UseVirtualizationReturn => {
  // 1. Validate and normalize all input props
  const validatedProps = useValidatedProps(props);

  // 2. Calculate all dimensions and averages
  const dimensions = useVirtualizationDimensions(
    validatedProps.numRows,
    validatedProps.numColumns,
    validatedProps.rowHeight,
    validatedProps.columnWidth
  );

  // 3. Manage visible range state and scroll handling
  const visibleRangeManager = useVisibleRange(
    validatedProps.containerHeight,
    validatedProps.containerWidth,
    validatedProps.numRows,
    validatedProps.numColumns,
    dimensions.avgRowHeight,
    dimensions.avgColumnWidth,
    validatedProps.overscanRowCount,
    validatedProps.overscanColumnCount
  );

  // 4. Create cell rendering function
  const renderCells = useRenderCells(
    visibleRangeManager.range,
    validatedProps.rowHeight,
    validatedProps.columnWidth,
    validatedProps.children
  );

  // Calculate scroll offsets for viewport compensation (no virtual scrolling)
  const scrollOffsetY =
    typeof validatedProps.rowHeight === "number"
      ? visibleRangeManager.range.firstRow * validatedProps.rowHeight
      : 0;

  const scrollOffsetX =
    typeof validatedProps.columnWidth === "number"
      ? visibleRangeManager.range.firstColumn * validatedProps.columnWidth
      : 0;

  return {
    onScroll: visibleRangeManager.onScroll,
    totalHeight: dimensions.totalHeight,
    totalWidth: dimensions.totalWidth,
    renderCells,
    containerHeight: validatedProps.containerHeight,
    containerWidth: validatedProps.containerWidth,
    scrollOffsetY,
    scrollOffsetX,
  };
};
