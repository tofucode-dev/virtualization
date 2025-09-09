import { RenderFunction, SizeFunction } from "../types/virtualization.types";

/**
 * Type guard functions for runtime type checking.
 */

/**
 * Type guard to check if a value is a SizeFunction.
 * 
 * @param fn - The value to check
 * @returns True if the value is a function that takes one parameter
 * 
 * @example
 * ```typescript
 * const size = (index: number) => index * 10;
 * if (isSizeFunction(size)) {
 *   // size is now typed as SizeFunction
 *   const result = size(5); // Returns 50
 * }
 * ```
 */
export const isSizeFunction = (fn: unknown): fn is SizeFunction => {
    return typeof fn === "function" && fn.length === 1; // This check would be enough for our use case
    // for other use cases i.e checking between two different functions with same amount of parameters, might need to add more checks like branded types
  };
  
/**
 * Type guard to check if a value is a RenderFunction.
 * 
 * @param fn - The value to check
 * @returns True if the value is a function that takes one parameter
 * 
 * @example
 * ```typescript
 * const renderer = ({ rowIndex, columnIndex, style }) => <div style={style}>Cell</div>;
 * if (isRenderFunction(renderer)) {
 *   // renderer is now typed as RenderFunction
 *   const element = renderer({ rowIndex: 0, columnIndex: 0, style: {} });
 * }
 * ```
 */
export const isRenderFunction = (fn: unknown): fn is RenderFunction => {
    return typeof fn === "function" && fn.length === 1;
  };