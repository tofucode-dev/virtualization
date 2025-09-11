import { renderHook } from "@testing-library/react";
import React from "react";

import { describe, expect, it, vi, beforeEach, afterAll } from "vitest";

import { VirtualizerProps } from "../../types/virtualization.types";
import { useValidatedProps } from "../use-validate-props";

// Mock console.warn to avoid noise in tests
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("useValidatedProps", () => {
  beforeEach(() => {
    mockConsoleWarn.mockClear();
  });

  afterAll(() => {
    mockConsoleWarn.mockRestore();
  });

  it("should return valid props when all props are provided correctly", () => {
    const props: VirtualizerProps = {
      numRows: 10,
      numColumns: 5,
      rowHeight: 50,
      columnWidth: 100,
      containerHeight: 400,
      containerWidth: 500,
      overscanRowCount: 2,
      overscanColumnCount: 1,
      children: ({ rowIndex, columnIndex, style, key }) =>
        React.createElement(
          "div",
          { key, style },
          `${rowIndex}:${columnIndex}`
        ),
    };

    const { result } = renderHook(() => useValidatedProps(props));

    expect(result.current).toEqual({
      numRows: 10,
      numColumns: 5,
      rowHeight: 50,
      columnWidth: 100,
      containerHeight: 400,
      containerWidth: 500,
      overscanRowCount: 2,
      overscanColumnCount: 1,
      children: expect.any(Function),
    });
  });

  it("should use fallback values for invalid numeric props", () => {
    const props: Partial<VirtualizerProps> = {
      numRows: -5,
      numColumns: "invalid" as any,
      rowHeight: null as any,
      columnWidth: undefined,
      containerHeight: -100,
      containerWidth: NaN,
      overscanRowCount: -2,
      overscanColumnCount: "invalid" as any,
      children: ({ rowIndex, columnIndex, style, key }) =>
        React.createElement(
          "div",
          { key, style },
          `${rowIndex}:${columnIndex}`
        ),
    };

    const { result } = renderHook(() =>
      useValidatedProps(props as VirtualizerProps)
    );

    expect(result.current.numRows).toBe(0);
    expect(result.current.numColumns).toBe(0);
    expect(result.current.rowHeight).toBe(0);
    expect(result.current.columnWidth).toBe(0);
    expect(result.current.containerHeight).toBe(0);
    expect(result.current.containerWidth).toBe(0);
    expect(result.current.overscanRowCount).toBe(1);
    expect(result.current.overscanColumnCount).toBe(1);
    expect(result.current.children).toBeDefined();
  });

  it("should handle size functions correctly", () => {
    const rowHeightFunction = (index: number) => index * 10;
    const columnWidthFunction = (index: number) => index * 20;

    const props: VirtualizerProps = {
      numRows: 5,
      numColumns: 3,
      rowHeight: rowHeightFunction,
      columnWidth: columnWidthFunction,
      containerHeight: 400,
      containerWidth: 500,
      overscanRowCount: 1,
      overscanColumnCount: 1,
      children: ({ rowIndex, columnIndex, style, key }) =>
        React.createElement(
          "div",
          { key, style },
          `${rowIndex}:${columnIndex}`
        ),
    };

    const { result } = renderHook(() => useValidatedProps(props));

    expect(result.current.rowHeight).toBe(rowHeightFunction);
    expect(result.current.columnWidth).toBe(columnWidthFunction);
  });

  it("should use fallback function for invalid children prop", () => {
    const props: Partial<VirtualizerProps> = {
      numRows: 5,
      numColumns: 3,
      rowHeight: 50,
      columnWidth: 100,
      containerHeight: 400,
      containerWidth: 500,
      overscanRowCount: 1,
      overscanColumnCount: 1,
      children: "not a function" as any,
    };

    const { result } = renderHook(() =>
      useValidatedProps(props as VirtualizerProps)
    );

    expect(result.current.children).toBeDefined();
    expect(typeof result.current.children).toBe("function");

    // Test that the fallback function returns null
    const fallbackResult = result.current.children({
      rowIndex: 0,
      columnIndex: 0,
      style: {},
      key: "test",
    });
    expect(fallbackResult).toBeNull();
  });

  it("should handle missing children prop", () => {
    const props: Partial<VirtualizerProps> = {
      numRows: 5,
      numColumns: 3,
      rowHeight: 50,
      columnWidth: 100,
      containerHeight: 400,
      containerWidth: 500,
      overscanRowCount: 1,
      overscanColumnCount: 1,
    };

    const { result } = renderHook(() =>
      useValidatedProps(props as VirtualizerProps)
    );

    expect(result.current.children).toBeDefined();
    expect(typeof result.current.children).toBe("function");

    // Test that the fallback function returns null
    const fallbackResult = result.current.children({
      rowIndex: 0,
      columnIndex: 0,
      style: {},
      key: "test",
    });
    expect(fallbackResult).toBeNull();
  });

  it("should handle edge case values", () => {
    const props: VirtualizerProps = {
      numRows: 0,
      numColumns: 0,
      rowHeight: 0,
      columnWidth: 0,
      containerHeight: 0,
      containerWidth: 0,
      overscanRowCount: 0,
      overscanColumnCount: 0,
      children: ({ rowIndex, columnIndex, style, key }) =>
        React.createElement(
          "div",
          { key, style },
          `${rowIndex}:${columnIndex}`
        ),
    };

    const { result } = renderHook(() => useValidatedProps(props));

    expect(result.current.numRows).toBe(0);
    expect(result.current.numColumns).toBe(0);
    expect(result.current.rowHeight).toBe(0);
    expect(result.current.columnWidth).toBe(0);
    expect(result.current.containerHeight).toBe(0);
    expect(result.current.containerWidth).toBe(0);
    expect(result.current.overscanRowCount).toBe(0); 
    expect(result.current.overscanColumnCount).toBe(0);
  });

  it("should handle very large numbers", () => {
    const props: VirtualizerProps = {
      numRows: Number.MAX_SAFE_INTEGER,
      numColumns: Number.MAX_SAFE_INTEGER,
      rowHeight: Number.MAX_SAFE_INTEGER,
      columnWidth: Number.MAX_SAFE_INTEGER,
      containerHeight: Number.MAX_SAFE_INTEGER,
      containerWidth: Number.MAX_SAFE_INTEGER,
      overscanRowCount: Number.MAX_SAFE_INTEGER,
      overscanColumnCount: Number.MAX_SAFE_INTEGER,
      children: ({ rowIndex, columnIndex, style, key }) =>
        React.createElement(
          "div",
          { key, style },
          `${rowIndex}:${columnIndex}`
        ),
    };

    const { result } = renderHook(() => useValidatedProps(props));

    expect(result.current.numRows).toBe(Number.MAX_SAFE_INTEGER);
    expect(result.current.numColumns).toBe(Number.MAX_SAFE_INTEGER);
    expect(result.current.rowHeight).toBe(Number.MAX_SAFE_INTEGER);
    expect(result.current.columnWidth).toBe(Number.MAX_SAFE_INTEGER);
    expect(result.current.containerHeight).toBe(Number.MAX_SAFE_INTEGER);
    expect(result.current.containerWidth).toBe(Number.MAX_SAFE_INTEGER);
    expect(result.current.overscanRowCount).toBe(Number.MAX_SAFE_INTEGER);
    expect(result.current.overscanColumnCount).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("should maintain referential stability for valid props", () => {
    const props: VirtualizerProps = {
      numRows: 10,
      numColumns: 5,
      rowHeight: 50,
      columnWidth: 100,
      containerHeight: 400,
      containerWidth: 500,
      overscanRowCount: 2,
      overscanColumnCount: 1,
      children: ({ rowIndex, columnIndex, style, key }) =>
        React.createElement(
          "div",
          { key, style },
          `${rowIndex}:${columnIndex}`
        ),
    };

    const { result, rerender } = renderHook(() => useValidatedProps(props));

    const firstResult = result.current;
    rerender();
    const secondResult = result.current;

    // Props should be the same reference for stable inputs
    expect(firstResult.children).toBe(secondResult.children);
    expect(firstResult.rowHeight).toBe(secondResult.rowHeight);
    expect(firstResult.columnWidth).toBe(secondResult.columnWidth);
  });

  it("should handle mixed valid and invalid props", () => {
    const props: Partial<VirtualizerProps> = {
      numRows: 10, // valid
      numColumns: "invalid" as any, // invalid
      rowHeight: 50, // valid
      columnWidth: (index: number) => index * 10, // valid function
      containerHeight: -100, // invalid
      containerWidth: 500, // valid
      overscanRowCount: 2, // valid
      overscanColumnCount: null as any, // invalid
      children: ({ rowIndex, columnIndex, style, key }) =>
        React.createElement(
          "div",
          { key, style },
          `${rowIndex}:${columnIndex}`
        ), // valid
    };

    const { result } = renderHook(() =>
      useValidatedProps(props as VirtualizerProps)
    );

    expect(result.current.numRows).toBe(10); // Should keep valid value
    expect(result.current.numColumns).toBe(0); // Should use fallback
    expect(result.current.rowHeight).toBe(50); // Should keep valid value
    expect(result.current.columnWidth).toBe(props.columnWidth); // Should keep valid function
    expect(result.current.containerHeight).toBe(0); // Should use fallback
    expect(result.current.containerWidth).toBe(500); // Should keep valid value
    expect(result.current.overscanRowCount).toBe(2); // Should keep valid value
    expect(result.current.overscanColumnCount).toBe(1); // Should use fallback
    expect(result.current.children).toBe(props.children); // Should keep valid function
  });
});
