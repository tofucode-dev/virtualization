import { act, renderHook } from "@testing-library/react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useVisibleRange } from "../use-visible-range";

// Mock DOM methods
const mockScrollContainer = {
  scrollTop: 0,
  scrollLeft: 0,
};

describe("useVisibleRange", () => {
  beforeEach(() => {
    // Reset mock scroll container
    mockScrollContainer.scrollTop = 0;
    mockScrollContainer.scrollLeft = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with correct visible range", () => {
    const scrollContainerRef = { current: mockScrollContainer as any };

    const { result } = renderHook(() =>
      useVisibleRange(
        400, // containerHeight
        500, // containerWidth
        10, // numRows
        5, // numColumns
        50, // avgRowHeight
        100, // avgColumnWidth
        2, // overscanRowCount
        1, // overscanColumnCount
        scrollContainerRef
      )
    );

    const { range } = result.current;

    // Initial visible rows: Math.floor(400 / 50) + 1 = 8 + 1 = 9
    // With overscan: firstRow = max(0, 0 - 2) = 0, lastRow = min(9, 9 - 1 + 2) = min(9, 10) = 9
    expect(range.firstRow).toBe(0);
    expect(range.lastRow).toBe(9);

    // Initial visible columns: Math.floor(500 / 100) + 1 = 5 + 1 = 6
    // With overscan: firstColumn = max(0, 0 - 1) = 0, lastColumn = min(5-1, 6 - 1 + 1) = min(4, 6) = 4
    expect(range.firstColumn).toBe(0);
    expect(range.lastColumn).toBe(4);
  });

  it("should handle zero container dimensions", () => {
    const scrollContainerRef = { current: mockScrollContainer as any };

    const { result } = renderHook(() =>
      useVisibleRange(
        0, // containerHeight
        0, // containerWidth
        10, // numRows
        5, // numColumns
        50, // avgRowHeight
        100, // avgColumnWidth
        1, // overscanRowCount
        1, // overscanColumnCount
        scrollContainerRef
      )
    );

    const { range } = result.current;

    // With zero container dimensions, should show minimal range
    expect(range.firstRow).toBe(0);
    expect(range.lastRow).toBe(1); // Math.max(0, Math.min(9, Math.floor(0/50) + 1 - 1 + 1)) = Math.max(0, Math.min(9, 1)) = 1
    expect(range.firstColumn).toBe(0);
    expect(range.lastColumn).toBe(1); // Math.max(0, Math.min(4, Math.floor(0/100) + 1 - 1 + 1)) = Math.max(0, Math.min(4, 1)) = 1
  });

  it("should handle zero grid dimensions", () => {
    const scrollContainerRef = { current: mockScrollContainer as any };

    const { result } = renderHook(() =>
      useVisibleRange(
        400, // containerHeight
        500, // containerWidth
        0, // numRows
        0, // numColumns
        50, // avgRowHeight
        100, // avgColumnWidth
        1, // overscanRowCount
        1, // overscanColumnCount
        scrollContainerRef
      )
    );

    const { range } = result.current;

    // With zero grid dimensions, range should be clamped to 0
    expect(range.firstRow).toBe(0);
    expect(range.lastRow).toBe(0);
    expect(range.firstColumn).toBe(0);
    expect(range.lastColumn).toBe(0);
  });

  it("should update range when scroll position changes", () => {
    const scrollContainerRef = { current: mockScrollContainer as any };

    const { result } = renderHook(() =>
      useVisibleRange(
        400, // containerHeight
        500, // containerWidth
        20, // numRows
        10, // numColumns
        50, // avgRowHeight
        100, // avgColumnWidth
        1, // overscanRowCount
        1, // overscanColumnCount
        scrollContainerRef
      )
    );

    const { onScroll } = result.current;

    // Simulate scroll to row 2, column 1
    mockScrollContainer.scrollTop = 100; // 2 * 50
    mockScrollContainer.scrollLeft = 100; // 1 * 100

    act(() => {
      onScroll({ currentTarget: mockScrollContainer } as any);
    });

    const { range } = result.current;

    // First visible row: Math.floor(100 / 50) = 2
    // Last visible row: Math.floor((100 + 400) / 50) = Math.floor(500 / 50) = 10
    // With overscan: firstRow = max(0, 2 - 1) = 1, lastRow = min(19, 10 + 1) = min(19, 11) = 11
    expect(range.firstRow).toBe(1);
    expect(range.lastRow).toBe(11);

    // First visible column: Math.floor(100 / 100) = 1
    // Last visible column: Math.floor((100 + 500) / 100) = Math.floor(600 / 100) = 6
    // With overscan: firstColumn = max(0, 1 - 1) = 0, lastColumn = min(9, 6 + 1) = min(9, 7) = 7
    expect(range.firstColumn).toBe(0);
    expect(range.lastColumn).toBe(7);
  });

  it("should handle large overscan values", () => {
    const scrollContainerRef = { current: mockScrollContainer as any };

    const { result } = renderHook(() =>
      useVisibleRange(
        400, // containerHeight
        500, // containerWidth
        10, // numRows
        5, // numColumns
        50, // avgRowHeight
        100, // avgColumnWidth
        10, // overscanRowCount (large)
        5, // overscanColumnCount (large)
        scrollContainerRef
      )
    );

    const { range } = result.current;

    // Should clamp to grid bounds even with large overscan
    expect(range.firstRow).toBe(0); // max(0, 0 - 10) = 0
    expect(range.lastRow).toBe(9); // min(9, 9 + 10) = min(9, 19) = 9
    expect(range.firstColumn).toBe(0); // max(0, 0 - 5) = 0
    expect(range.lastColumn).toBe(4); // min(4, 6 + 5) = min(4, 11) = 4
  });

  it("should handle scroll beyond grid bounds", () => {
    const scrollContainerRef = { current: mockScrollContainer as any };

    const { result } = renderHook(() =>
      useVisibleRange(
        400, // containerHeight
        500, // containerWidth
        10, // numRows
        5, // numColumns
        50, // avgRowHeight
        100, // avgColumnWidth
        1, // overscanRowCount
        1, // overscanColumnCount
        scrollContainerRef
      )
    );

    const { onScroll } = result.current;

    // Scroll way beyond the grid
    mockScrollContainer.scrollTop = 2000; // Way beyond 10 * 50 = 500
    mockScrollContainer.scrollLeft = 2000; // Way beyond 5 * 100 = 500

    act(() => {
      onScroll({ currentTarget: mockScrollContainer } as any);
    });

    const { range } = result.current;

    // Should clamp to grid bounds
    expect(range.firstRow).toBe(9); // max(0, min(9, 40 - 1)) = max(0, min(9, 39)) = 9
    expect(range.lastRow).toBe(9); // min(9, 40 + 1) = min(9, 41) = 9
    expect(range.firstColumn).toBe(4); // max(0, min(4, 20 - 1)) = max(0, min(4, 19)) = 4
    expect(range.lastColumn).toBe(4); // min(4, 20 + 1) = min(4, 21) = 4
  });

  it("should provide setRange function", () => {
    const scrollContainerRef = { current: mockScrollContainer as any };

    const { result } = renderHook(() =>
      useVisibleRange(
        400, // containerHeight
        500, // containerWidth
        10, // numRows
        5, // numColumns
        50, // avgRowHeight
        100, // avgColumnWidth
        1, // overscanRowCount
        1, // overscanColumnCount
        scrollContainerRef
      )
    );

    const { setRange } = result.current;

    expect(typeof setRange).toBe("function");

    // Test setting a custom range
    act(() => {
      setRange({
        firstRow: 2,
        lastRow: 5,
        firstColumn: 1,
        lastColumn: 3,
      });
    });

    const { range } = result.current;
    expect(range.firstRow).toBe(2);
    expect(range.lastRow).toBe(5);
    expect(range.firstColumn).toBe(1);
    expect(range.lastColumn).toBe(3);
  });

  it("should handle null scroll container ref", () => {
    const scrollContainerRef = { current: null };

    const { result } = renderHook(() =>
      useVisibleRange(
        400, // containerHeight
        500, // containerWidth
        10, // numRows
        5, // numColumns
        50, // avgRowHeight
        100, // avgColumnWidth
        1, // overscanRowCount
        1, // overscanColumnCount
        scrollContainerRef
      )
    );

    // Should not throw and should return initial range
    const { range } = result.current;
    expect(range).toBeDefined();
    expect(range.firstRow).toBe(0);
    expect(range.lastRow).toBe(9);
    expect(range.firstColumn).toBe(0);
    expect(range.lastColumn).toBe(4);
  });

  it("should handle very small cell dimensions", () => {
    const scrollContainerRef = { current: mockScrollContainer as any };

    const { result } = renderHook(() =>
      useVisibleRange(
        400, // containerHeight
        500, // containerWidth
        100, // numRows
        100, // numColumns
        0.1, // avgRowHeight (very small)
        0.1, // avgColumnWidth (very small)
        1, // overscanRowCount
        1, // overscanColumnCount
        scrollContainerRef
      )
    );

    const { range } = result.current;

    // Should handle very small dimensions without issues
    expect(range.firstRow).toBe(0);
    expect(range.lastRow).toBeGreaterThan(0);
    expect(range.firstColumn).toBe(0);
    expect(range.lastColumn).toBeGreaterThan(0);
  });

  it("should maintain referential stability of onScroll", () => {
    const scrollContainerRef = { current: mockScrollContainer as any };

    const { result, rerender } = renderHook(() =>
      useVisibleRange(
        400, // containerHeight
        500, // containerWidth
        10, // numRows
        5, // numColumns
        50, // avgRowHeight
        100, // avgColumnWidth
        1, // overscanRowCount
        1, // overscanColumnCount
        scrollContainerRef
      )
    );

    const firstOnScroll = result.current.onScroll;

    // Rerender with same props
    rerender();

    const secondOnScroll = result.current.onScroll;

    // onScroll should be the same reference due to useCallback
    expect(firstOnScroll).toBe(secondOnScroll);
  });

  it("should handle scroll position correction when dimensions change", () => {
    const scrollContainerRef = { current: mockScrollContainer as any };

    // Set initial scroll position
    mockScrollContainer.scrollTop = 200;
    mockScrollContainer.scrollLeft = 300;

    const { rerender } = renderHook(
      ({ containerHeight, containerWidth, numRows, numColumns }) =>
        useVisibleRange(
          containerHeight,
          containerWidth,
          numRows,
          numColumns,
          50, // avgRowHeight
          100, // avgColumnWidth
          1, // overscanRowCount
          1, // overscanColumnCount
          scrollContainerRef
        ),
      {
        initialProps: {
          containerHeight: 400,
          containerWidth: 500,
          numRows: 20,
          numColumns: 10,
        },
      }
    );

    // Change dimensions to smaller grid
    rerender({
      containerHeight: 400,
      containerWidth: 500,
      numRows: 5, // Smaller grid
      numColumns: 3, // Smaller grid
    });

    // Scroll position should be corrected to stay within bounds
    // Max scroll top: max(0, 5 * 50 - 400) = max(0, 250 - 400) = 0
    // Max scroll left: max(0, 3 * 100 - 500) = max(0, 300 - 500) = 0
    expect(mockScrollContainer.scrollTop).toBe(0);
    expect(mockScrollContainer.scrollLeft).toBe(0);
  });
});
