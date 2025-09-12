import { useCallback, useRef } from "react";

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
 * - **useValidatedProps**: Validates and normalizes input props with fallback values
 * - **useVirtualizationDimensions**: Calculates total and average dimensions for the grid
 * - **useVisibleRange**: Manages visible row/column state and scroll position correction
 * - **useRenderCells**: Renders only visible cells efficiently with memoized styles
 *
 * Key Features:
 * - **Automatic Scroll Correction**: Handles invalid scroll positions when grid dimensions change
 * - **Overscan Support**: Renders extra cells outside viewport for smoother scrolling
 * - **Performance Optimized**: Uses focused useEffect hooks and memoization
 * - **Error Resilient**: Includes error boundaries and fallback handling
 *
 * This composition approach provides:
 * - **Better Testability**: Each concern can be tested in isolation
 * - **Better Maintainability**: Single responsibility per hook
 * - **Better Reusability**: Individual hooks can be used elsewhere
 * - **Better Performance**: Fine-grained memoization and optimized re-renders
 *
 * @param props - The virtualizer configuration props
 * @returns An object containing all necessary values and functions for virtualization
 *
 * @example
 * ```tsx
 * const {
 *   onScroll,
 *   totalHeight,
 *   totalWidth,
 *   renderCells,
 *   scrollContainerRef
 * } = useVirtualization({
 *   numRows: 1000,
 *   numColumns: 1000,
 *   rowHeight: 50,
 *   columnWidth: 100,
 *   containerHeight: 400,
 *   containerWidth: 400,
 *   overscanRowCount: 5,
 *   overscanColumnCount: 3,
 *   children: ({ rowIndex, columnIndex, style }) => (
 *     <div style={style}>Cell {rowIndex}:{columnIndex}</div>
 *   )
 * });
 * ```
 */
export const useVirtualization = (
  props: VirtualizerProps
): UseVirtualizationReturn => {
  // Create internal ref for scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    validatedProps.overscanColumnCount,
    scrollContainerRef
  );

  // 4. Create cell rendering function
  const renderCells = useRenderCells(
    visibleRangeManager.range,
    validatedProps.rowHeight,
    validatedProps.columnWidth,
    validatedProps.children
  );

  const { onRenderStart, onRenderEnd } = props;

  const performanceRenderCells = useCallback(() => {
    onRenderStart?.();
    const cells = renderCells();
    onRenderEnd?.(cells.length);

    return cells;
  }, [renderCells, onRenderStart, onRenderEnd]);
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
    renderCells: performanceRenderCells,
    containerHeight: validatedProps.containerHeight,
    containerWidth: validatedProps.containerWidth,
    scrollOffsetY,
    scrollOffsetX,
    scrollContainerRef,
  };
};
