import { renderHook } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import { useVirtualizationDimensions } from "../use-virtualization-dimensions";

describe("useVirtualizationDimensions", () => {
  it("should calculate dimensions correctly with fixed sizes", () => {
    const { result } = renderHook(() =>
      useVirtualizationDimensions(10, 5, 50, 100)
    );

    expect(result.current.totalHeight).toBe(500); // 10 * 50
    expect(result.current.totalWidth).toBe(500); // 5 * 100
    expect(result.current.avgRowHeight).toBe(50);
    expect(result.current.avgColumnWidth).toBe(100);
  });

  it("should calculate dimensions correctly with size functions", () => {
    const rowHeightFunction = (index: number) => index * 10;
    const columnWidthFunction = (index: number) => index * 20;

    const { result } = renderHook(() =>
      useVirtualizationDimensions(5, 3, rowHeightFunction, columnWidthFunction)
    );

    // Total height: 0*10 + 1*10 + 2*10 + 3*10 + 4*10 = 0 + 10 + 20 + 30 + 40 = 100
    expect(result.current.totalHeight).toBe(100);
    // Total width: 0*20 + 1*20 + 2*20 = 0 + 20 + 40 = 60
    expect(result.current.totalWidth).toBe(60);
    // Average height: 100 / 5 = 20
    expect(result.current.avgRowHeight).toBe(20);
    // Average width: 60 / 3 = 20
    expect(result.current.avgColumnWidth).toBe(20);
  });

  it("should handle zero rows and columns", () => {
    const { result } = renderHook(() =>
      useVirtualizationDimensions(0, 0, 50, 100)
    );

    expect(result.current.totalHeight).toBe(0);
    expect(result.current.totalWidth).toBe(0);
    expect(result.current.avgRowHeight).toBe(0);
    expect(result.current.avgColumnWidth).toBe(0);
  });

  it("should handle mixed fixed and function sizes", () => {
    const rowHeightFunction = (index: number) => index * 5;

    const { result } = renderHook(() =>
      useVirtualizationDimensions(4, 3, rowHeightFunction, 100)
    );

    // Total height: 0*5 + 1*5 + 2*5 + 3*5 = 0 + 5 + 10 + 15 = 30
    expect(result.current.totalHeight).toBe(30);
    // Total width: 3 * 100 = 300
    expect(result.current.totalWidth).toBe(300);
    // Average height: 30 / 4 = 7.5
    expect(result.current.avgRowHeight).toBe(7.5);
    // Average width: 100 (fixed)
    expect(result.current.avgColumnWidth).toBe(100);
  });

  it("should handle single row and column", () => {
    const { result } = renderHook(() =>
      useVirtualizationDimensions(1, 1, 50, 100)
    );

    expect(result.current.totalHeight).toBe(50);
    expect(result.current.totalWidth).toBe(100);
    expect(result.current.avgRowHeight).toBe(50);
    expect(result.current.avgColumnWidth).toBe(100);
  });

  it("should handle large numbers", () => {
    const { result } = renderHook(() =>
      useVirtualizationDimensions(1000, 500, 25, 50)
    );

    expect(result.current.totalHeight).toBe(25000); // 1000 * 25
    expect(result.current.totalWidth).toBe(25000); // 500 * 50
    expect(result.current.avgRowHeight).toBe(25);
    expect(result.current.avgColumnWidth).toBe(50);
  });

  it("should handle zero sizes", () => {
    const { result } = renderHook(() =>
      useVirtualizationDimensions(5, 3, 0, 0)
    );

    expect(result.current.totalHeight).toBe(0);
    expect(result.current.totalWidth).toBe(0);
    expect(result.current.avgRowHeight).toBe(0);
    expect(result.current.avgColumnWidth).toBe(0);
  });

  it("should handle complex size functions", () => {
    const complexRowFunction = (index: number) => Math.pow(index + 1, 2);
    const complexColumnFunction = (index: number) => (index + 1) * 10;

    const { result } = renderHook(() =>
      useVirtualizationDimensions(
        3,
        2,
        complexRowFunction,
        complexColumnFunction
      )
    );

    // Total height: 1² + 2² + 3² = 1 + 4 + 9 = 14
    expect(result.current.totalHeight).toBe(14);
    // Total width: 1*10 + 2*10 = 10 + 20 = 30
    expect(result.current.totalWidth).toBe(30);
    // Average height: 14 / 3 ≈ 4.67
    expect(result.current.avgRowHeight).toBeCloseTo(4.67, 2);
    // Average width: 30 / 2 = 15
    expect(result.current.avgColumnWidth).toBe(15);
  });

  it("should memoize results correctly", () => {
    const { result, rerender } = renderHook(
      ({ numRows, numColumns, rowHeight, columnWidth }) =>
        useVirtualizationDimensions(
          numRows,
          numColumns,
          rowHeight,
          columnWidth
        ),
      {
        initialProps: {
          numRows: 5,
          numColumns: 3,
          rowHeight: 50,
          columnWidth: 100,
        },
      }
    );

    const firstResult = result.current;

    // Rerender with same props
    rerender({
      numRows: 5,
      numColumns: 3,
      rowHeight: 50,
      columnWidth: 100,
    });

    const secondResult = result.current;

    // Results should be the same reference due to memoization
    expect(firstResult).toStrictEqual(secondResult);
  });

  it("should recalculate when dependencies change", () => {
    const { result, rerender } = renderHook(
      ({ numRows, numColumns, rowHeight, columnWidth }) =>
        useVirtualizationDimensions(
          numRows,
          numColumns,
          rowHeight,
          columnWidth
        ),
      {
        initialProps: {
          numRows: 5,
          numColumns: 3,
          rowHeight: 50,
          columnWidth: 100,
        },
      }
    );

    const firstResult = result.current;

    // Change props
    rerender({
      numRows: 10,
      numColumns: 3,
      rowHeight: 50,
      columnWidth: 100,
    });

    const secondResult = result.current;

    // Results should be different
    expect(firstResult).not.toBe(secondResult);
    expect(secondResult.totalHeight).toBe(500); // 10 * 50
    expect(secondResult.avgRowHeight).toBe(50);
  });

  it("should handle function size changes", () => {
    const rowHeightFunction1 = (index: number) => index * 10;
    const rowHeightFunction2 = (index: number) => index * 20;

    const { result, rerender } = renderHook(
      ({ numRows, numColumns, rowHeight, columnWidth }) =>
        useVirtualizationDimensions(
          numRows,
          numColumns,
          rowHeight,
          columnWidth
        ),
      {
        initialProps: {
          numRows: 3,
          numColumns: 2,
          rowHeight: rowHeightFunction1,
          columnWidth: 100,
        },
      }
    );

    const firstResult = result.current;

    // Change the function
    rerender({
      numRows: 3,
      numColumns: 2,
      rowHeight: rowHeightFunction2,
      columnWidth: 100,
    });

    const secondResult = result.current;

    // Results should be different
    expect(firstResult).not.toBe(secondResult);
    // Total height with function1: 0*10 + 1*10 + 2*10 = 30
    // Total height with function2: 0*20 + 1*20 + 2*20 = 60
    expect(secondResult.totalHeight).toBe(60);
    expect(secondResult.avgRowHeight).toBe(20);
  });

  it("should handle edge case with very small numbers", () => {
    const { result } = renderHook(() =>
      useVirtualizationDimensions(2, 2, 0.1, 0.2)
    );

    expect(result.current.totalHeight).toBe(0.2); // 2 * 0.1
    expect(result.current.totalWidth).toBe(0.4); // 2 * 0.2
    expect(result.current.avgRowHeight).toBe(0.1);
    expect(result.current.avgColumnWidth).toBe(0.2);
  });

  it("should handle negative size functions", () => {
    const negativeRowFunction = (index: number) => -(index + 1);
    const negativeColumnFunction = (index: number) => -(index + 1) * 10;

    const { result } = renderHook(() =>
      useVirtualizationDimensions(
        3,
        2,
        negativeRowFunction,
        negativeColumnFunction
      )
    );

    // Total height: -1 + -2 + -3 = -6
    expect(result.current.totalHeight).toBe(-6);
    // Total width: -10 + -20 = -30
    expect(result.current.totalWidth).toBe(-30);
    // Average height: -6 / 3 = -2
    expect(result.current.avgRowHeight).toBe(-2);
    // Average width: -30 / 2 = -15
    expect(result.current.avgColumnWidth).toBe(-15);
  });
});
