import { useCallback, useEffect, useState } from "react";

import {
  VisibleRange,
  VisibleRangeManager,
} from "../types/virtualization.types";

/**
 * Custom hook that manages the visible range of cells in the virtualized grid.
 *
 * This hook handles two main responsibilities:
 * 1. **Visible Range Calculation**: Determines which rows and columns are currently visible
 *    based on scroll position and container dimensions
 * 2. **Scroll Position Management**: Automatically corrects invalid scroll positions when
 *    grid dimensions change to prevent showing empty space
 *
 * Features:
 * - **Overscan Support**: Renders extra cells outside the viewport for smoother scrolling
 * - **Automatic Range Updates**: Recalculates visible range when grid dimensions change
 * - **Scroll Position Correction**: Ensures scroll position stays within valid bounds
 * - **Performance Optimized**: Uses focused useEffect hooks for efficient updates
 *
 * @param containerHeight - The height of the container viewport
 * @param containerWidth - The width of the container viewport
 * @param numRows - The total number of rows in the grid
 * @param numColumns - The total number of columns in the grid
 * @param avgRowHeight - The average height of a row (for position calculations)
 * @param avgColumnWidth - The average width of a column (for position calculations)
 * @param overscanRowCount - Number of extra rows to render outside the visible area
 * @param overscanColumnCount - Number of extra columns to render outside the visible area
 * @param scrollContainerRef - Ref to the scroll container for position management
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
  overscanColumnCount: number,
  scrollContainerRef: React.RefObject<HTMLDivElement>
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

  // Recalculate visible range when grid dimensions change
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollLeft } = scrollContainerRef.current;

      // Calculate visible range based on current scroll position
      const firstVisibleRow = Math.floor(scrollTop / avgRowHeight);
      const lastVisibleRow = Math.floor(
        (scrollTop + containerHeight) / avgRowHeight
      );
      const firstVisibleColumn = Math.floor(scrollLeft / avgColumnWidth);
      const lastVisibleColumn = Math.floor(
        (scrollLeft + containerWidth) / avgColumnWidth
      );

      // Apply overscan with bounds checking
      setRange({
        firstRow: Math.max(0, firstVisibleRow - overscanRowCount),
        lastRow: Math.min(numRows - 1, lastVisibleRow + overscanRowCount),
        firstColumn: Math.max(0, firstVisibleColumn - overscanColumnCount),
        lastColumn: Math.min(
          numColumns - 1,
          lastVisibleColumn + overscanColumnCount
        ),
      });
    }
  }, [
    containerHeight,
    containerWidth,
    avgRowHeight,
    avgColumnWidth,
    numRows,
    numColumns,
    overscanRowCount,
    overscanColumnCount,
    scrollContainerRef,
  ]);

  // Correct scroll position when grid dimensions change
  useEffect(() => {
    if (scrollContainerRef.current) {
      const maxScrollTop = Math.max(
        0,
        numRows * avgRowHeight - containerHeight
      );
      const maxScrollLeft = Math.max(
        0,
        numColumns * avgColumnWidth - containerWidth
      );

      const currentScrollTop = scrollContainerRef.current.scrollTop;
      const currentScrollLeft = scrollContainerRef.current.scrollLeft;

      // Clamp scroll position to valid bounds
      const newScrollTop = Math.min(
        Math.max(0, currentScrollTop),
        maxScrollTop
      );
      const newScrollLeft = Math.min(
        Math.max(0, currentScrollLeft),
        maxScrollLeft
      );

      // Update scroll position if it changed
      if (
        currentScrollTop !== newScrollTop ||
        currentScrollLeft !== newScrollLeft
      ) {
        scrollContainerRef.current.scrollTop = newScrollTop;
        scrollContainerRef.current.scrollLeft = newScrollLeft;
      }
    }
  }, [
    containerHeight,
    containerWidth,
    avgRowHeight,
    avgColumnWidth,
    numRows,
    numColumns,
    scrollContainerRef,
  ]);

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
