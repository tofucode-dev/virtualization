import { RenderFunction, SizeFunction } from "../types/virtualization.types";
import { isRenderFunction, isSizeFunction } from "./type-guards";

//HELPER FUNCTIONS
export const checkNumberProp = (prop: unknown, fallback: number): number => {
    if (typeof prop === "number" && !isNaN(prop) && isFinite(prop)) {
      return prop;
    }
  
    return fallback;
  };
  
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