/**
 * Type definitions for the virtualization system.
 */

// ============================================================================
// CORE FUNCTION TYPES
// ============================================================================

/** Function for calculating dynamic sizes based on index. */
export type SizeFunction = (index: number) => number;

/** Information passed to the render function for each cell. */
export interface CellInfo {
  rowIndex: number;
  columnIndex: number;
  /** CSS styles for absolute positioning and sizing */
  style: React.CSSProperties;
}

/** Function for rendering individual cells. Returns React nodes. */
export type RenderFunction = (info: CellInfo) => React.ReactNode;

/** Size value - either fixed number or dynamic function. */
export type Size = number | SizeFunction;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/** Raw input props for the Virtualizer component. */
export interface VirtualizerProps {
  numRows: number;
  numColumns: number;
  rowHeight: Size;
  columnWidth: Size;
  containerHeight: number;
  containerWidth: number;
  children: RenderFunction;
}

/** Validated props with guaranteed safe values for virtualization. */
export interface ValidatedVirtualizerProps {
  numRows: number;
  numColumns: number;
  rowHeight: Size;
  columnWidth: Size;
  containerHeight: number;
  containerWidth: number;
  children: RenderFunction;
}

// ============================================================================
// DATA STRUCTURES
// ============================================================================

/** Range of currently visible cells (indices are inclusive and 0-based). */
export interface VisibleRange {
  firstRow: number;
  lastRow: number;
  firstColumn: number;
  lastColumn: number;
}

/** Calculated dimensions and metrics for virtualization. */
export interface VirtualizationDimensions {
  totalHeight: number;
  totalWidth: number;
  /** Used for scroll position calculations */
  avgRowHeight: number;
  /** Used for scroll position calculations */
  avgColumnWidth: number;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/** Main virtualization hook return type. */
export interface UseVirtualizationReturn {
  onScroll: React.UIEventHandler<HTMLDivElement>;
  totalHeight: number;
  totalWidth: number;
  renderCells: () => React.ReactNode[];
  containerHeight: number;
  containerWidth: number;
  scrollOffsetY: number;
  scrollOffsetX: number;
}

/** Manages visible range state and scroll handling. */
export interface VisibleRangeManager {
  range: VisibleRange;
  setRange: (range: VisibleRange) => void;
  onScroll: React.UIEventHandler<HTMLDivElement>;
}

/** Cell rendering hook return type. */
export interface UseRenderCellsReturn {
  (): React.ReactNode[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Partial visible range for updates. */
export type VisibleRangeUpdate = Partial<VisibleRange>;

/** Cell coordinates in the grid. */
export interface CellCoordinates {
  rowIndex: number;
  columnIndex: number;
}
