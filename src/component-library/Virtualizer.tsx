import React from "react";

import { useVirtualization } from "../hooks/use-virtualization";
import { VirtualizerProps } from "../types/virtualization.types";

export const Virtualizer = React.memo<VirtualizerProps>(props => {
  const {
    onScroll,
    totalHeight,
    totalWidth,
    renderCells,
    containerHeight,
    containerWidth,
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
        {renderCells()}
      </div>
    </div>
  );
});
