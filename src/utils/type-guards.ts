import { RenderFunction, SizeFunction } from "../types/virtualization.types";

// typeguards
export const isSizeFunction = (fn: unknown): fn is SizeFunction => {
    return typeof fn === "function" && fn.length === 1; // This check would be enough for our use case
    // for other use cases i.e checking between two different functions with same amount of parameters, might need to add more checks like branded types
  };
  
export const isRenderFunction = (fn: unknown): fn is RenderFunction => {
    return typeof fn === "function" && fn.length === 1;
  };