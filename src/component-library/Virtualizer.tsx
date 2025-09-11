import React from "react";

import { useVirtualization } from "../hooks/use-virtualization";
import { VirtualizerProps } from "../types/virtualization.types";

/**
 * A virtualized grid component that efficiently renders only visible cells.
 *
 * This component uses virtualization to handle large datasets by only rendering
 * cells that are currently visible in the viewport, significantly improving
 * performance for large grids.
 *
 * Key Features:
 * - **Automatic Scroll Management**: Handles scroll position correction when grid dimensions change
 * - **Overscan Support**: Renders extra cells outside viewport for smoother scrolling
 * - **Performance Optimized**: Uses React.memo with custom comparison for efficient re-renders
 * - **Error Resilient**: Includes error boundaries and fallback handling
 * - **Internal State Management**: All scroll logic is encapsulated within the component
 *
 * @param props - The virtualizer configuration props
 * @returns A memoized virtualized grid component with automatic scroll management
 *
 * @example
 * ```tsx
 * <Virtualizer
 *   numRows={1000}
 *   numColumns={1000}
 *   rowHeight={50}
 *   columnWidth={100}
 *   containerHeight={400}
 *   containerWidth={400}
 *   overscanRowCount={5}
 *   overscanColumnCount={3}
 * >
 *   {({ rowIndex, columnIndex, style }) => (
 *     <div style={style}>
 *       Cell {rowIndex}:{columnIndex}
 *     </div>
 *   )}
 * </Virtualizer>
 * ```
 */
export const Virtualizer = React.memo<VirtualizerProps>(props => {
  const {
    onScroll,
    renderCells,
    totalHeight,
    totalWidth,
    containerHeight,
    containerWidth,
    scrollOffsetY,
    scrollOffsetX,
    scrollContainerRef,
  } = useVirtualization(props);

  return (
    <div
      ref={scrollContainerRef}
      style={{
        height: containerHeight,
        width: containerWidth,
        overflow: "auto",
      }}
      onScroll={onScroll}
    >
      <div
        style={{
          position: "relative",
          height: totalHeight,
          width: totalWidth,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            // Translate the content to show the correct "window" of cells
            // This compensates for the viewport-relative positioning
            transform: `translate(${scrollOffsetX}px, ${scrollOffsetY}px)`,
          }}
        >
          {renderCells()}
        </div>
      </div>
    </div>
  );
});
