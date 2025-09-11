import {
  ValidatedVirtualizerProps,
  VirtualizerProps,
} from "../types/virtualization.types";
import {
  checkFunctionProp,
  checkNumberOrSizeFunctionProp,
  checkNumberProp,
} from "../utils/virtualization-utils";

/**
 * Custom hook that validates and normalizes the props for the Virtualizer component.
 *
 * Ensures all props have valid values and provides safe fallbacks for invalid inputs,
 * preventing runtime errors in virtualization calculations.
 *
 * @param props - The raw props to validate and normalize
 * @returns Validated and normalized props safe for virtualization
 */
export const useValidatedProps = (
  props: VirtualizerProps
): ValidatedVirtualizerProps => {
  const numRows = checkNumberProp(props.numRows, 0);
  const numColumns = checkNumberProp(props.numColumns, 0);
  const rowHeight = checkNumberOrSizeFunctionProp(props.rowHeight, 0);
  const columnWidth = checkNumberOrSizeFunctionProp(props.columnWidth, 0);
  const containerHeight = checkNumberProp(props.containerHeight, 0);
  const containerWidth = checkNumberProp(props.containerWidth, 0);
  const children = checkFunctionProp(props.children, () => null);
  const overscanRowCount = checkNumberProp(props.overscanRowCount, 1);
  const overscanColumnCount = checkNumberProp(props.overscanColumnCount, 1);

  return {
    numRows,
    numColumns,
    rowHeight,
    columnWidth,
    containerHeight,
    containerWidth,
    children,
    overscanRowCount,
    overscanColumnCount,
  };
};
