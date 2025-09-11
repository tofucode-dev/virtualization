import { RenderFunction, SizeFunction } from "../types/virtualization.types";
import { isRenderFunction, isSizeFunction } from "./type-guards";

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
 * Fixed size
 * calculateCumulativeSize(5, 50) // Returns 250
 *
 * Dynamic size
 * calculateCumulativeSize(3, (index) => index * 10) // Returns 0 + 10 + 20 = 30
 *
 * calculateCumulativeSize(3, (index) => index * 10, 2) // Returns 20 + 30 + 40 = 90
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

  // For dynamic sizes, use a more efficient loop instead of array operations
  let total = 0;
  for (let i = 0; i < count; i++) {
    const itemSize = calculateSafeSize(size, startIndex + i, 0, "size");
    total += itemSize;
  }

  return total;
};

/**
 * Safely calculates a size value with error handling and validation.
 *
 * This function handles both fixed sizes (numbers) and dynamic sizes (functions),
 * providing robust error handling and fallback values for invalid results.
 *
 * @param size - Either a fixed size (number) or a function that returns size for the given index
 * @param index - The index to calculate size for
 * @param fallback - The fallback value to use if calculation fails or returns invalid result
 * @param dimension - The dimension name for error logging ("height", "width", or "size")
 * @returns A valid size value or the fallback value
 *
 * @example
 * ```typescript
 * // Fixed size
 * calculateSafeSize(50, 0, 50, "height") // Returns 50
 *
 * // Dynamic size function
 * calculateSafeSize((index) => index * 10, 2, 50, "height") // Returns 20
 *
 * // Error handling
 * calculateSafeSize((index) => { throw new Error("Bad function"); }, 1, 50, "height") // Returns 50
 * ```
 */
export const calculateSafeSize = (
  size: number | SizeFunction,
  index: number,
  fallback: number,
  dimension: "height" | "width" | "size"
): number => {
  try {
    const calculatedSize = typeof size === "number" ? size : size(index);

    // Validate the calculated size
    if (
      typeof calculatedSize !== "number" ||
      isNaN(calculatedSize) ||
      !isFinite(calculatedSize) ||
      calculatedSize < 0
    ) {
      console.warn(`Invalid ${dimension} at index ${index}: ${calculatedSize}`);

      return fallback;
    }

    return calculatedSize;
  } catch (error) {
    console.warn(`Error calculating ${dimension} at index ${index}:`, error);

    return fallback;
  }
};

/**
 * Creates CSS positioning styles for a virtualized cell using viewport-relative positioning.
 *
 * This approach positions cells relative to the first visible cell instead of absolute origin,
 * keeping CSS values small and eliminating browser rendering limits.
 *
 * @param rowIndex - The row index of the cell
 * @param columnIndex - The column index of the cell
 * @param firstVisibleRow - The first visible row index (viewport reference)
 * @param firstVisibleColumn - The first visible column index (viewport reference)
 * @param rowHeight - Either a fixed height or a function that returns height for each row
 * @param columnWidth - Either a fixed width or a function that returns width for each column
 * @returns CSS properties object with viewport-relative positioning
 */
export const createCellStyle = (
  rowIndex: number,
  columnIndex: number,
  firstVisibleRow: number,
  firstVisibleColumn: number,
  rowHeight: number | SizeFunction,
  columnWidth: number | SizeFunction
): React.CSSProperties => {
  // Calculate position relative to first visible cell (keeps values small)
  const relativeRowIndex = rowIndex - firstVisibleRow;
  const relativeColumnIndex = columnIndex - firstVisibleColumn;

  // For fixed sizes, simple multiplication (most common case)
  const top =
    typeof rowHeight === "number"
      ? relativeRowIndex * rowHeight
      : calculateCumulativeSize(relativeRowIndex, rowHeight, firstVisibleRow);

  const left =
    typeof columnWidth === "number"
      ? relativeColumnIndex * columnWidth
      : calculateCumulativeSize(
          relativeColumnIndex,
          columnWidth,
          firstVisibleColumn
        );

  // Safely calculate height and width using the extracted function
  const height = calculateSafeSize(rowHeight, rowIndex, 50, "height");
  const width = calculateSafeSize(columnWidth, columnIndex, 100, "width");

  return {
    position: "absolute",
    top,
    left,
    height,
    width,
  };
};

/**
 * Validates and normalizes a number property with a fallback value.
 *
 * @param prop - The property value to validate
 * @param fallback - The fallback value if validation fails
 * @returns A valid number or the fallback value
 */
export const checkNumberProp = (prop: unknown, fallback: number): number => {
  if (typeof prop === "number" && !isNaN(prop) && isFinite(prop) && prop >= 0) {
    return prop;
  }

  return fallback;
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
  if (typeof prop === "number" && !isNaN(prop) && isFinite(prop) && prop >= 0) {
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
