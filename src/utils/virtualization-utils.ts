import { RenderFunction, SizeFunction } from "../types/virtualization.types";
import { isRenderFunction, isSizeFunction } from "./type-guards";

/**
 * Validates and normalizes a number property with a fallback value.
 * 
 * @param prop - The property value to validate
 * @param fallback - The fallback value if validation fails
 * @returns A valid number or the fallback value
 */
export const checkNumberProp = (prop: unknown, fallback: number): number => {
    if (typeof prop === "number" && !isNaN(prop) && isFinite(prop)) {
      return prop;
    }
  
    return fallback;
  };
  
/**
 * Calculates the cumulative size for a given number of items.
 * 
 * For fixed sizes, this is a simple multiplication. For dynamic sizes,
 * it sums up the individual sizes using the provided size function.
 * 
 * @param count - The number of items to calculate size for
 * @param size - Either a fixed size (number) or a function that returns size for each index
 * @param startIndex - The starting index for size calculations (default: 0)
 * @returns The total cumulative size
 * 
 * @example
 * ```typescript
 * // Fixed size
 * calculateCumulativeSize(5, 50) // Returns 250
 * 
 * // Dynamic size
 * calculateCumulativeSize(3, (index) => index * 10) // Returns 0 + 10 + 20 = 30
 * ```
 */
export const calculateCumulativeSize = (
  count: number,
  size: number | SizeFunction,
  startIndex: number = 0
): number => {
    if (typeof size === "number") {
      return count * size;
    }
  
    return new Array(count)
      .fill(null)
      .reduce<number>((acc, _, index) => acc + size(startIndex + index), 0);
  };
  
/**
 * Creates CSS positioning styles for a virtualized cell.
 * 
 * Calculates the absolute position and dimensions for a cell based on
 * its row and column indices and the size configuration.
 * 
 * @param rowIndex - The row index of the cell
 * @param columnIndex - The column index of the cell
 * @param rowHeight - Either a fixed height or a function that returns height for each row
 * @param columnWidth - Either a fixed width or a function that returns width for each column
 * @returns CSS properties object with absolute positioning and dimensions
 * 
 * @example
 * ```typescript
 * const style = createCellStyle(2, 3, 50, 100);
 * // Returns: { position: 'absolute', top: 100, left: 300, height: 50, width: 100 }
 * ```
 */
export const createCellStyle = (
  rowIndex: number,
  columnIndex: number,
  rowHeight: number | SizeFunction,
  columnWidth: number | SizeFunction
): React.CSSProperties => {
    const top = calculateCumulativeSize(rowIndex, rowHeight);
    const left = calculateCumulativeSize(columnIndex, columnWidth);
  
    const height =
      typeof rowHeight === "number" ? rowHeight : rowHeight(rowIndex);
    const width =
      typeof columnWidth === "number" ? columnWidth : columnWidth(columnIndex);
  
    return {
      position: "absolute",
      top,
      left,
      height,
      width,
    };
  };
  
/**
 * Validates and normalizes a property that can be either a number or a size function.
 * 
 * @param prop - The property value to validate
 * @param fallback - The fallback value if validation fails
 * @returns A valid number, size function, or the fallback value
 */
export const checkNumberOrSizeFunctionProp = (
  prop: unknown,
  fallback: number
): number | SizeFunction => {
    if (typeof prop === "number" && !isNaN(prop) && isFinite(prop)) {
      return prop;
    }
    if (isSizeFunction(prop)) {
      return prop;
    }
  
    return fallback;
  };
  
/**
 * Validates and normalizes a render function property.
 * 
 * @param prop - The property value to validate
 * @param fallback - The fallback function if validation fails
 * @returns A valid render function or the fallback function
 */
export const checkFunctionProp = (
  prop: unknown,
  fallback: () => null
): RenderFunction => {
    if (isRenderFunction(prop)) {
      return prop;
    } else {
      return fallback;
    }
  };