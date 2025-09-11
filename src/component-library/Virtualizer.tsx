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
 * @param props - The virtualizer configuration props
 * @returns A memoized virtualized grid component
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
  } = useVirtualization(props);

  return (
    <div
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
