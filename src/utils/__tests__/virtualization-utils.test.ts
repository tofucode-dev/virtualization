import React from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CellInfo,
  RenderFunction,
  SizeFunction,
} from "../../types/virtualization.types";
import {
  calculateCumulativeSize,
  calculateSafeSize,
  checkFunctionProp,
  checkNumberOrSizeFunctionProp,
  checkNumberProp,
  createCellStyle,
} from "../virtualization-utils";

// Mock console.warn to avoid noise in tests
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("virtualization-utils", () => {
  beforeEach(() => {
    mockConsoleWarn.mockClear();
  });

  describe("calculateCumulativeSize", () => {
    it("should calculate cumulative size for fixed size", () => {
      expect(calculateCumulativeSize(5, 50)).toBe(250);
      expect(calculateCumulativeSize(3, 100)).toBe(300);
      expect(calculateCumulativeSize(0, 50)).toBe(0);
    });

    it("should calculate cumulative size for dynamic size function", () => {
      const sizeFunction: SizeFunction = (index: number) => index * 10;
      expect(calculateCumulativeSize(3, sizeFunction)).toBe(30); // 0 + 10 + 20
      expect(calculateCumulativeSize(3, sizeFunction, 2)).toBe(90); // 20 + 30 + 40
    });

    it("should handle edge cases", () => {
      expect(calculateCumulativeSize(0, 50)).toBe(0);
      expect(calculateCumulativeSize(1, 0)).toBe(0);

      const sizeFunction: SizeFunction = () => 0;
      expect(calculateCumulativeSize(5, sizeFunction)).toBe(0);
    });

    it("should handle size function errors gracefully", () => {
      const errorFunction: SizeFunction = (index: number) => {
        if (index === 1) {
          throw new Error("Test error");
        }

        return index * 10;
      };

      // Should not throw, should use fallback values
      expect(() => calculateCumulativeSize(3, errorFunction)).not.toThrow();
    });
  });

  describe("calculateSafeSize", () => {
    it("should return fixed size when size is a number", () => {
      expect(calculateSafeSize(50, 0, 100, "height")).toBe(50);
      expect(calculateSafeSize(0, 0, 100, "height")).toBe(0);
    });

    it("should calculate size using function", () => {
      const sizeFunction: SizeFunction = (index: number) => index * 10;
      expect(calculateSafeSize(sizeFunction, 2, 50, "height")).toBe(20);
      expect(calculateSafeSize(sizeFunction, 0, 50, "height")).toBe(0);
    });

    it("should return fallback for invalid function results", () => {
      const invalidFunction: SizeFunction = () => NaN;
      expect(calculateSafeSize(invalidFunction, 0, 50, "height")).toBe(50);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Invalid height at index 0: NaN"
      );

      const negativeFunction: SizeFunction = () => -10;
      expect(calculateSafeSize(negativeFunction, 0, 50, "height")).toBe(50);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Invalid height at index 0: -10"
      );

      const infinityFunction: SizeFunction = () => Infinity;
      expect(calculateSafeSize(infinityFunction, 0, 50, "height")).toBe(50);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Invalid height at index 0: Infinity"
      );
    });

    it("should handle function errors and return fallback", () => {
      const errorFunction: SizeFunction = () => {
        throw new Error("Test error");
      };

      expect(calculateSafeSize(errorFunction, 0, 50, "height")).toBe(50);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Error calculating height at index 0:",
        expect.any(Error)
      );
    });

    it("should handle non-numeric function results", () => {
      const stringFunction: SizeFunction = () => "invalid" as any;
      expect(calculateSafeSize(stringFunction, 0, 50, "height")).toBe(50);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Invalid height at index 0: invalid"
      );
    });
  });

  describe("createCellStyle", () => {
    it("should create correct styles for fixed sizes", () => {
      const style = createCellStyle(2, 3, 1, 1, 50, 100);

      expect(style).toEqual({
        position: "absolute",
        top: 50, // (2 - 1) * 50
        left: 200, // (3 - 1) * 100
        height: 50,
        width: 100,
      });
    });

    it("should create correct styles for dynamic sizes", () => {
      const rowHeightFunction: SizeFunction = (index: number) => index * 10;
      const columnWidthFunction: SizeFunction = (index: number) => index * 20;

      const style = createCellStyle(
        2,
        3,
        1,
        1,
        rowHeightFunction,
        columnWidthFunction
      );

      expect(style).toEqual({
        position: "absolute",
        top: 10, // cumulative size from index 1 to 2
        left: 60, // cumulative size from index 1 to 3: 20 + 40 = 60
        height: 20, // rowHeightFunction(2)
        width: 60, // columnWidthFunction(3)
      });
    });

    it("should handle edge cases", () => {
      const style = createCellStyle(0, 0, 0, 0, 50, 100);

      expect(style).toEqual({
        position: "absolute",
        top: 0,
        left: 0,
        height: 50,
        width: 100,
      });
    });

    it("should handle negative indices", () => {
      const style = createCellStyle(1, 1, 2, 2, 50, 100);

      expect(style).toEqual({
        position: "absolute",
        top: -50, // (1 - 2) * 50
        left: -100, // (1 - 2) * 100
        height: 50,
        width: 100,
      });
    });
  });

  describe("checkNumberProp", () => {
    it("should return valid numbers", () => {
      expect(checkNumberProp(42, 0)).toBe(42);
      expect(checkNumberProp(0, 10)).toBe(0);
      expect(checkNumberProp(-5, 10)).toBe(-5);
      expect(checkNumberProp(3.14, 10)).toBe(3.14);
    });

    it("should return fallback for invalid values", () => {
      expect(checkNumberProp(NaN, 10)).toBe(10);
      expect(checkNumberProp(Infinity, 10)).toBe(10);
      expect(checkNumberProp(-Infinity, 10)).toBe(10);
      expect(checkNumberProp("42", 10)).toBe(10);
      expect(checkNumberProp(null, 10)).toBe(10);
      expect(checkNumberProp(undefined, 10)).toBe(10);
      expect(checkNumberProp({}, 10)).toBe(10);
    });
  });

  describe("checkNumberOrSizeFunctionProp", () => {
    it("should return valid numbers", () => {
      expect(checkNumberOrSizeFunctionProp(42, 0)).toBe(42);
      expect(checkNumberOrSizeFunctionProp(0, 10)).toBe(0);
    });

    it("should return valid size functions", () => {
      const sizeFunction: SizeFunction = (index: number) => index * 10;
      expect(checkNumberOrSizeFunctionProp(sizeFunction, 0)).toBe(sizeFunction);
    });

    it("should return fallback for invalid values", () => {
      expect(checkNumberOrSizeFunctionProp(NaN, 10)).toBe(10);
      expect(checkNumberOrSizeFunctionProp("42", 10)).toBe(10);
      expect(checkNumberOrSizeFunctionProp(null, 10)).toBe(10);
      expect(checkNumberOrSizeFunctionProp({}, 10)).toBe(10);

      // Invalid function (wrong number of parameters)
      const invalidFunction = () => 42;
      expect(checkNumberOrSizeFunctionProp(invalidFunction, 10)).toBe(10);
    });
  });

  describe("checkFunctionProp", () => {
    it("should return valid render functions", () => {
      const renderFunction: RenderFunction = (info: CellInfo) =>
        React.createElement(
          "div",
          {
            style: info.style,
            "data-row": info.rowIndex,
            "data-column": info.columnIndex,
          },
          `Cell ${info.rowIndex}:${info.columnIndex}`
        );
      const result = checkFunctionProp(renderFunction, () => null);
      expect(result).toBe(renderFunction);
    });

    it("should return fallback for invalid values", () => {
      const fallback = () => null;
      expect(checkFunctionProp(42, fallback)).toBe(fallback);
      expect(checkFunctionProp("function", fallback)).toBe(fallback);
      expect(checkFunctionProp(null, fallback)).toBe(fallback);
      expect(checkFunctionProp({}, fallback)).toBe(fallback);

      // Invalid function (wrong number of parameters)
      const invalidFunction = () => null;
      expect(checkFunctionProp(invalidFunction, fallback)).toBe(fallback);
    });
  });

  describe("integration tests", () => {
    it("should work together for complex scenarios", () => {
      const rowHeightFunction: SizeFunction = (index: number) => 50 + index * 5;
      const columnWidthFunction: SizeFunction = (index: number) =>
        100 + index * 10;

      // Test cumulative size calculation
      const totalHeight = calculateCumulativeSize(3, rowHeightFunction);
      expect(totalHeight).toBe(165); // 50 + 55 + 60

      // Test safe size calculation
      const safeHeight = calculateSafeSize(rowHeightFunction, 2, 50, "height");
      expect(safeHeight).toBe(60);

      // Test cell style creation
      const style = createCellStyle(
        2,
        2,
        1,
        1,
        rowHeightFunction,
        columnWidthFunction
      );
      expect(style.top).toBe(55); // rowHeightFunction(1) = 55
      expect(style.left).toBe(110); // columnWidthFunction(1) = 110
      expect(style.height).toBe(60); // rowHeightFunction(2) = 60
      expect(style.width).toBe(120); // columnWidthFunction(2) = 120
    });

    it("should handle error scenarios gracefully", () => {
      const errorFunction: SizeFunction = (index: number) => {
        if (index === 1) {
          throw new Error("Test error");
        }

        return index * 10;
      };

      // Should not throw errors
      expect(() => calculateCumulativeSize(3, errorFunction)).not.toThrow();
      expect(() =>
        calculateSafeSize(errorFunction, 1, 50, "height")
      ).not.toThrow();
      expect(() =>
        createCellStyle(1, 1, 0, 0, errorFunction, 100)
      ).not.toThrow();

      // Should use fallback values
      expect(calculateSafeSize(errorFunction, 1, 50, "height")).toBe(50);
    });
  });
});
