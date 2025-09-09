//TYPES
export interface SizeFunction {
  (index: number): number;
}

export interface RenderFunction {
  (info: CellInfo): JSX.Element | null; // Can be replaced with React.ReactNode for better React type compatibility
}

export interface CellInfo {
  rowIndex: number;
  columnIndex: number;
  style: React.CSSProperties;
}

export interface VirtualizerProps {
  numRows: number;
  numColumns: number;
  rowHeight: number | SizeFunction;
  columnWidth: number | SizeFunction;
  containerHeight: number;
  containerWidth: number;
  children: RenderFunction;
}
