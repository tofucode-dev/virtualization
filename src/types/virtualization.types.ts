/**
 * Type definitions for the virtualization system.
 */

/**
 * Function type for calculating dynamic sizes based on index.
 * 
 * @param index - The index of the item
 * @returns The size for the item at the given index
 */
export interface SizeFunction {
  (index: number): number;
}

/**
 * Function type for rendering individual cells in the virtualized grid.
 * 
 * @param info - Information about the cell to render
 * @returns JSX element or null for the cell
 */
export interface RenderFunction {
  (info: CellInfo): JSX.Element | null; // Can be replaced with React.ReactNode for better React type compatibility
}

/**
 * Information passed to the render function for each cell.
 */
export interface CellInfo {
  /** The row index of the cell */
  rowIndex: number;
  /** The column index of the cell */
  columnIndex: number;
  /** CSS styles for positioning the cell */
  style: React.CSSProperties;
}

/**
 * Props for the Virtualizer component.
 */
export interface VirtualizerProps {
  /** Number of rows in the grid */
  numRows: number;
  /** Number of columns in the grid */
  numColumns: number;
  /** Height of each row (fixed) or function to calculate height per row */
  rowHeight: number | SizeFunction;
  /** Width of each column (fixed) or function to calculate width per column */
  columnWidth: number | SizeFunction;
  /** Height of the container viewport */
  containerHeight: number;
  /** Width of the container viewport */
  containerWidth: number;
  /** Function to render each cell */
  children: RenderFunction;
}
