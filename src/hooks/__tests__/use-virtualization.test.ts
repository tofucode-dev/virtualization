import { act, renderHook } from "@testing-library/react";
import React from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { VirtualizerProps } from "../../types/virtualization.types";
import { useVirtualization } from "../use-virtualization";

// Mock DOM methods
const mockScrollContainer = {
  scrollTop: 0,
  scrollLeft: 0,
};

describe("useVirtualization", () => {
  beforeEach(() => {
    // Reset mock scroll container
    mockScrollContainer.scrollTop = 0;
    mockScrollContainer.scrollLeft = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createMockProps = (
    overrides: Partial<VirtualizerProps> = {}
  ): VirtualizerProps => ({
    numRows: 10,
    numColumns: 5,
    rowHeight: 50,
    columnWidth: 100,
    containerHeight: 400,
    containerWidth: 500,
    overscanRowCount: 2,
    overscanColumnCount: 1,
    children: ({ rowIndex, columnIndex, style, key }) =>
      React.createElement("div", { key, style }, `${rowIndex}:${columnIndex}`),
    ...overrides,
  });

  it("should return all required properties", () => {
    const props = createMockProps();
    const { result } = renderHook(() => useVirtualization(props));

    const {
      onScroll,
      totalHeight,
      totalWidth,
      renderCells,
      containerHeight,
      containerWidth,
      scrollOffsetY,
      scrollOffsetX,
      scrollContainerRef,
    } = result.current;

    expect(typeof onScroll).toBe("function");
    expect(typeof totalHeight).toBe("number");
    expect(typeof totalWidth).toBe("number");
    expect(typeof renderCells).toBe("function");
    expect(typeof containerHeight).toBe("number");
    expect(typeof containerWidth).toBe("number");
    expect(typeof scrollOffsetY).toBe("number");
    expect(typeof scrollOffsetX).toBe("number");
    expect(scrollContainerRef).toBeDefined();
    expect(scrollContainerRef.current).toBeNull(); // Initially null
  });

  it("should calculate correct dimensions", () => {
    const props = createMockProps({
      numRows: 20,
      numColumns: 10,
      rowHeight: 30,
      columnWidth: 80,
    });

    const { result } = renderHook(() => useVirtualization(props));

    const { totalHeight, totalWidth, containerHeight, containerWidth } =
      result.current;

    expect(totalHeight).toBe(600); // 20 * 30
    expect(totalWidth).toBe(800); // 10 * 80
    expect(containerHeight).toBe(400);
    expect(containerWidth).toBe(500);
  });

  it("should handle size functions", () => {
    const rowHeightFunction = (index: number) => index * 10 + 50;
    const columnWidthFunction = (index: number) => index * 20 + 100;

    const props = createMockProps({
      numRows: 3,
      numColumns: 2,
      rowHeight: rowHeightFunction,
      columnWidth: columnWidthFunction,
    });

    const { result } = renderHook(() => useVirtualization(props));

    const { totalHeight, totalWidth } = result.current;

    // Total height: 0*10+50 + 1*10+50 + 2*10+50 = 50 + 60 + 70 = 180
    expect(totalHeight).toBe(180);
    // Total width: 0*20+100 + 1*20+100 = 100 + 120 = 220
    expect(totalWidth).toBe(220);
  });

  it("should provide scroll container ref", () => {
    const props = createMockProps();
    const { result } = renderHook(() => useVirtualization(props));

    const { scrollContainerRef } = result.current;

    expect(scrollContainerRef).toBeDefined();
    expect(scrollContainerRef.current).toBeNull();

    // Simulate attaching ref to DOM element
    act(() => {
      (scrollContainerRef as any).current = mockScrollContainer;
    });

    expect(scrollContainerRef.current).toBe(mockScrollContainer);
  });

  it("should handle scroll events", () => {
    const props = createMockProps();
    const { result } = renderHook(() => useVirtualization(props));

    const { onScroll, scrollContainerRef } = result.current;

    // Set up scroll container
    act(() => {
      (scrollContainerRef as any).current = mockScrollContainer;
    });

    // Simulate scroll
    mockScrollContainer.scrollTop = 100;
    mockScrollContainer.scrollLeft = 200;

    act(() => {
      onScroll({ currentTarget: mockScrollContainer } as any);
    });

    // Should not throw and should update internal state
    expect(mockScrollContainer.scrollTop).toBe(100);
    expect(mockScrollContainer.scrollLeft).toBe(200);
  });

  it("should render cells correctly", () => {
    const props = createMockProps({
      numRows: 3,
      numColumns: 2,
    });

    const { result } = renderHook(() => useVirtualization(props));

    const { renderCells } = result.current;
    const cells = renderCells();

    // Should render cells for the visible range
    expect(Array.isArray(cells)).toBe(true);
    expect(cells.length).toBeGreaterThan(0);

    // Each cell should be a React element
    cells.forEach(cell => {
      expect(React.isValidElement(cell)).toBe(true);
    });
  });

  it("should calculate scroll offsets for fixed sizes", () => {
    const props = createMockProps({
      numRows: 10,
      numColumns: 5,
      rowHeight: 50,
      columnWidth: 100,
    });

    const { result } = renderHook(() => useVirtualization(props));

    const { scrollOffsetY, scrollOffsetX } = result.current;

    // Initial scroll offsets should be 0 (no scroll)
    expect(scrollOffsetY).toBe(0);
    expect(scrollOffsetX).toBe(0);
  });

  it("should handle zero scroll offsets for size functions", () => {
    const rowHeightFunction = (index: number) => index * 10 + 50;
    const columnWidthFunction = (index: number) => index * 20 + 100;

    const props = createMockProps({
      rowHeight: rowHeightFunction,
      columnWidth: columnWidthFunction,
    });

    const { result } = renderHook(() => useVirtualization(props));

    const { scrollOffsetY, scrollOffsetX } = result.current;

    // For size functions, scroll offsets should be 0
    expect(scrollOffsetY).toBe(0);
    expect(scrollOffsetX).toBe(0);
  });

  it("should handle invalid props gracefully", () => {
    const invalidProps = {
      numRows: -5,
      numColumns: "invalid" as any,
      rowHeight: null as any,
      columnWidth: undefined as any,
      containerHeight: -100,
      containerWidth: NaN,
      overscanRowCount: -2,
      overscanColumnCount: "invalid" as any,
      children: "not a function" as any,
    };

    const { result } = renderHook(() => useVirtualization(invalidProps));

    const {
      totalHeight,
      totalWidth,
      containerHeight,
      containerWidth,
      scrollOffsetY,
      scrollOffsetX,
    } = result.current;

    // Should use fallback values
    expect(totalHeight).toBe(0);
    expect(totalWidth).toBe(0);
    expect(containerHeight).toBe(0);
    expect(containerWidth).toBe(0);
    expect(scrollOffsetY).toBe(0);
    expect(scrollOffsetX).toBe(0);
  });

  it("should handle zero dimensions", () => {
    const props = createMockProps({
      numRows: 0,
      numColumns: 0,
      containerHeight: 0,
      containerWidth: 0,
    });

    const { result } = renderHook(() => useVirtualization(props));

    const { totalHeight, totalWidth, containerHeight, containerWidth } =
      result.current;

    expect(totalHeight).toBe(0);
    expect(totalWidth).toBe(0);
    expect(containerHeight).toBe(0);
    expect(containerWidth).toBe(0);
  });

  it("should maintain referential stability", () => {
    const props = createMockProps();
    const { result, rerender } = renderHook(() => useVirtualization(props));

    const firstResult = result.current;

    // Rerender with same props
    rerender();

    const secondResult = result.current;

    // Functions should be stable due to useCallback
    expect(firstResult.onScroll).toBe(secondResult.onScroll);
    expect(firstResult.renderCells).toBe(secondResult.renderCells);
    expect(firstResult.scrollContainerRef).toBe(
      secondResult.scrollContainerRef
    );
  });

  it("should recalculate when props change", () => {
    const { result, rerender } = renderHook(
      ({ props }) => useVirtualization(props),
      {
        initialProps: {
          props: createMockProps({
            numRows: 5,
            numColumns: 3,
            rowHeight: 50,
            columnWidth: 100,
          }),
        },
      }
    );

    const firstResult = result.current;

    // Change props
    rerender({
      props: createMockProps({
        numRows: 10,
        numColumns: 5,
        rowHeight: 60,
        columnWidth: 120,
      }),
    });

    const secondResult = result.current;

    // Dimensions should be different
    expect(firstResult.totalHeight).toBe(250); // 5 * 50
    expect(secondResult.totalHeight).toBe(600); // 10 * 60
    expect(firstResult.totalWidth).toBe(300); // 3 * 100
    expect(secondResult.totalWidth).toBe(600); // 5 * 120
  });

  it("should handle large datasets", () => {
    const props = createMockProps({
      numRows: 1000,
      numColumns: 1000,
      rowHeight: 20,
      columnWidth: 50,
    });

    const { result } = renderHook(() => useVirtualization(props));

    const { totalHeight, totalWidth } = result.current;

    expect(totalHeight).toBe(20000); // 1000 * 20
    expect(totalWidth).toBe(50000); // 1000 * 50
  });

  it("should handle overscan correctly", () => {
    const props = createMockProps({
      numRows: 10,
      numColumns: 5,
      overscanRowCount: 3,
      overscanColumnCount: 2,
    });

    const { result } = renderHook(() => useVirtualization(props));

    const { renderCells } = result.current;
    const cells = renderCells();

    // Should render cells including overscan
    expect(Array.isArray(cells)).toBe(true);
    expect(cells.length).toBeGreaterThan(0);
  });

  it("should handle children function errors", () => {
    const errorChildren = vi.fn(({ rowIndex, columnIndex }) => {
      if (rowIndex === 1 && columnIndex === 1) {
        throw new Error("Test error");
      }

      return React.createElement("div", null, `${rowIndex}:${columnIndex}`);
    });

    const props = createMockProps({
      children: errorChildren,
    });

    const { result } = renderHook(() => useVirtualization(props));

    const { renderCells } = result.current;

    // Should not throw
    expect(() => renderCells()).not.toThrow();

    // Should render some cells (including error fallbacks)
    const cells = renderCells();
    expect(Array.isArray(cells)).toBe(true);
  });

  it("should handle scroll position correction", () => {
    const { result, rerender } = renderHook(
      ({ props: testProps }) => useVirtualization(testProps),
      {
        initialProps: {
          props: createMockProps({
            numRows: 5,
            numColumns: 3,
            rowHeight: 50,
            columnWidth: 100,
          }),
        },
      }
    );

    const { scrollContainerRef } = result.current;

    // Set up scroll container with invalid scroll position
    act(() => {
      (scrollContainerRef as any).current = mockScrollContainer;
      mockScrollContainer.scrollTop = 1000; // Beyond grid bounds
      mockScrollContainer.scrollLeft = 1000; // Beyond grid bounds
    });

    // Trigger dimension change by changing container size
    rerender({
      props: createMockProps({
        numRows: 5,
        numColumns: 3,
        rowHeight: 50,
        columnWidth: 100,
        containerHeight: 300, // Changed from 400
        containerWidth: 400, // Changed from 500
      }),
    });

    // Scroll position should be corrected
    expect(mockScrollContainer.scrollTop).toBeLessThanOrEqual(100); // max(0, 5*50-300)
    expect(mockScrollContainer.scrollLeft).toBeLessThanOrEqual(0); // max(0, 3*100-400)
  });

  it("should handle mixed size types", () => {
    const rowHeightFunction = (index: number) => index * 10 + 50;

    const props = createMockProps({
      rowHeight: rowHeightFunction,
      columnWidth: 100, // Fixed width
    });

    const { result } = renderHook(() => useVirtualization(props));

    const { totalHeight, totalWidth, scrollOffsetY, scrollOffsetX } =
      result.current;

    expect(totalHeight).toBeGreaterThan(0);
    expect(totalWidth).toBe(500); // 5 * 100
    expect(scrollOffsetY).toBe(0); // Function-based height
    expect(scrollOffsetX).toBe(0); // Fixed width, no scroll yet
  });
});
