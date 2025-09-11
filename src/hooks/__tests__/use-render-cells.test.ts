import { renderHook } from "@testing-library/react";
import React from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { VisibleRange } from "../../types/virtualization.types";
import { useRenderCells } from "../use-render-cells";

// Mock console.warn to avoid noise in tests
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("useRenderCells", () => {
  beforeEach(() => {
    mockConsoleWarn.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockChildren = vi.fn(({ rowIndex, columnIndex, style, key }) =>
    React.createElement("div", { key, style }, `${rowIndex}:${columnIndex}`)
  );

  it("should render cells for the visible range", () => {
    const range: VisibleRange = {
      firstRow: 0,
      lastRow: 2,
      firstColumn: 0,
      lastColumn: 1,
    };

    const { result } = renderHook(() =>
      useRenderCells(range, 50, 100, mockChildren)
    );

    const renderCells = result.current;
    const cells = renderCells();

    // Should render 3 rows × 2 columns = 6 cells
    expect(cells).toHaveLength(6);
    expect(mockChildren).toHaveBeenCalledTimes(6);

    // Check that all expected cells are rendered
    const expectedCalls = [
      { rowIndex: 0, columnIndex: 0 },
      { rowIndex: 0, columnIndex: 1 },
      { rowIndex: 1, columnIndex: 0 },
      { rowIndex: 1, columnIndex: 1 },
      { rowIndex: 2, columnIndex: 0 },
      { rowIndex: 2, columnIndex: 1 },
    ];

    expectedCalls.forEach((expected, index) => {
      expect(mockChildren).toHaveBeenNthCalledWith(index + 1, {
        rowIndex: expected.rowIndex,
        columnIndex: expected.columnIndex,
        style: expect.any(Object),
        key: `${expected.rowIndex}-${expected.columnIndex}`,
      });
    });
  });

  it("should render single cell", () => {
    const range: VisibleRange = {
      firstRow: 1,
      lastRow: 1,
      firstColumn: 2,
      lastColumn: 2,
    };

    const { result } = renderHook(() =>
      useRenderCells(range, 50, 100, mockChildren)
    );

    const renderCells = result.current;
    const cells = renderCells();

    expect(cells).toHaveLength(1);
    expect(mockChildren).toHaveBeenCalledTimes(1);
    expect(mockChildren).toHaveBeenCalledWith({
      rowIndex: 1,
      columnIndex: 2,
      style: expect.any(Object),
      key: "1-2",
    });
  });

  it("should handle empty range", () => {
    const range: VisibleRange = {
      firstRow: 2,
      lastRow: 1, // Invalid range
      firstColumn: 2,
      lastColumn: 1, // Invalid range
    };

    const { result } = renderHook(() =>
      useRenderCells(range, 50, 100, mockChildren)
    );

    const renderCells = result.current;
    const cells = renderCells();

    expect(cells).toHaveLength(0);
    expect(mockChildren).not.toHaveBeenCalled();
  });

  it("should handle size functions", () => {
    const range: VisibleRange = {
      firstRow: 0,
      lastRow: 1,
      firstColumn: 0,
      lastColumn: 1,
    };

    const rowHeightFunction = (index: number) => index * 10 + 50;
    const columnWidthFunction = (index: number) => index * 20 + 100;

    const { result } = renderHook(() =>
      useRenderCells(
        range,
        rowHeightFunction,
        columnWidthFunction,
        mockChildren
      )
    );

    const renderCells = result.current;
    const cells = renderCells();

    expect(cells).toHaveLength(4);
    expect(mockChildren).toHaveBeenCalledTimes(4);

    // Check that styles are calculated correctly for each cell
    const expectedStyles = [
      { top: 0, left: 0, height: 50, width: 100 }, // (0,0)
      { top: 0, left: 100, height: 50, width: 120 }, // (0,1)
      { top: 50, left: 0, height: 60, width: 100 }, // (1,0)
      { top: 50, left: 100, height: 60, width: 120 }, // (1,1)
    ];

    expectedStyles.forEach((expectedStyle, index) => {
      const call = mockChildren.mock.calls[index][0];
      expect(call.style).toMatchObject(expectedStyle);
    });
  });

  it("should handle children function errors gracefully", () => {
    const range: VisibleRange = {
      firstRow: 0,
      lastRow: 1,
      firstColumn: 0,
      lastColumn: 1,
    };

    const errorChildren = vi.fn(({ rowIndex, columnIndex }) => {
      if (rowIndex === 1 && columnIndex === 1) {
        throw new Error("Test error");
      }

      return React.createElement("div", null, `${rowIndex}:${columnIndex}`);
    });

    const { result } = renderHook(() =>
      useRenderCells(range, 50, 100, errorChildren)
    );

    const renderCells = result.current;
    const cells = renderCells();

    // Should render 4 cells (3 successful + 1 error fallback)
    expect(cells).toHaveLength(4);
    expect(errorChildren).toHaveBeenCalledTimes(4);

    // Check that error cell is rendered with fallback styling
    const errorCell = cells[3]; // Last cell should be the error fallback
    expect(React.isValidElement(errorCell)).toBe(true);

    if (React.isValidElement(errorCell)) {
      expect(errorCell.props.style).toMatchObject({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffebee",
        color: "#c62828",
        fontSize: "12px",
        border: "1px solid #ffcdd2",
      });
      expect(errorCell.props.children).toBe("Error");
    }

    // Should have logged warning
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      "Error rendering cell at 1:1:",
      expect.any(Error)
    );
  });

  it("should render all cells with valid styles", () => {
    const range: VisibleRange = {
      firstRow: 0,
      lastRow: 1,
      firstColumn: 0,
      lastColumn: 1,
    };

    // Test with normal cell rendering (no mocking needed)

    const { result } = renderHook(() =>
      useRenderCells(range, 50, 100, mockChildren)
    );

    const renderCells = result.current;
    const cells = renderCells();

    // Should render 4 cells (createCellStyle always returns valid styles)
    expect(cells).toHaveLength(4);
    expect(mockChildren).toHaveBeenCalledTimes(4);
  });

  it("should memoize cell styles", () => {
    const range: VisibleRange = {
      firstRow: 0,
      lastRow: 1,
      firstColumn: 0,
      lastColumn: 1,
    };

    const { result, rerender } = renderHook(() =>
      useRenderCells(range, 50, 100, mockChildren)
    );

    const firstRenderCells = result.current;
    const firstCells = firstRenderCells();

    // Rerender with same props
    rerender();

    const secondRenderCells = result.current;
    const secondCells = secondRenderCells();

    // Styles should be memoized (same reference)
    if (
      React.isValidElement(firstCells[0]) &&
      React.isValidElement(secondCells[0])
    ) {
      expect(firstCells[0].props.style).toBe(secondCells[0].props.style);
    }
    if (
      React.isValidElement(firstCells[1]) &&
      React.isValidElement(secondCells[1])
    ) {
      expect(firstCells[1].props.style).toBe(secondCells[1].props.style);
    }
  });

  it("should recalculate styles when range changes", () => {
    const { result, rerender } = renderHook(
      ({ range }) => useRenderCells(range, 50, 100, mockChildren),
      {
        initialProps: {
          range: {
            firstRow: 0,
            lastRow: 1,
            firstColumn: 0,
            lastColumn: 1,
          },
        },
      }
    );

    const firstRenderCells = result.current;
    const firstCells = firstRenderCells();

    // Change range
    rerender({
      range: {
        firstRow: 1,
        lastRow: 2,
        firstColumn: 1,
        lastColumn: 2,
      },
    });

    const secondRenderCells = result.current;
    const secondCells = secondRenderCells();

    // Should render different cells
    expect(firstCells).toHaveLength(4);
    expect(secondCells).toHaveLength(4);

    // Should have different content
    if (
      React.isValidElement(firstCells[0]) &&
      React.isValidElement(secondCells[0])
    ) {
      expect(firstCells[0].props.children).toBe("0:0");
      expect(secondCells[0].props.children).toBe("1:1");
    }
  });

  it("should recalculate styles when size functions change", () => {
    const rowHeightFunction1 = (index: number) => index * 10 + 50;
    const rowHeightFunction2 = (index: number) => index * 20 + 100;

    const { result, rerender } = renderHook(
      ({ rowHeight }) =>
        useRenderCells(
          {
            firstRow: 0,
            lastRow: 1,
            firstColumn: 0,
            lastColumn: 1,
          },
          rowHeight,
          100,
          mockChildren
        ),
      {
        initialProps: {
          rowHeight: rowHeightFunction1,
        },
      }
    );

    const firstRenderCells = result.current;
    const firstCells = firstRenderCells();

    // Change row height function
    rerender({
      rowHeight: rowHeightFunction2,
    });

    const secondRenderCells = result.current;
    const secondCells = secondRenderCells();

    // Styles should be different
    if (
      React.isValidElement(firstCells[0]) &&
      React.isValidElement(secondCells[0])
    ) {
      expect(firstCells[0].props.style.top).toBe(0);
      expect(secondCells[0].props.style.top).toBe(0);
    }
    if (
      React.isValidElement(firstCells[2]) &&
      React.isValidElement(secondCells[2])
    ) {
      expect(firstCells[2].props.style.top).toBe(50); // rowHeightFunction1(0) = 0*10+50 = 50
      expect(secondCells[2].props.style.top).toBe(100); // rowHeightFunction2(0) = 0*20+100 = 100
    }
  });

  it("should handle very large ranges", () => {
    const range: VisibleRange = {
      firstRow: 0,
      lastRow: 100,
      firstColumn: 0,
      lastColumn: 100,
    };

    const { result } = renderHook(() =>
      useRenderCells(range, 50, 100, mockChildren)
    );

    const renderCells = result.current;
    const cells = renderCells();

    // Should render 101 × 101 = 10,201 cells
    expect(cells).toHaveLength(10201);
    expect(mockChildren).toHaveBeenCalledTimes(10201);
  });

  it("should maintain referential stability of renderCells function", () => {
    const range: VisibleRange = {
      firstRow: 0,
      lastRow: 1,
      firstColumn: 0,
      lastColumn: 1,
    };

    const { result, rerender } = renderHook(() =>
      useRenderCells(range, 50, 100, mockChildren)
    );

    const firstRenderCells = result.current;

    // Rerender with same props
    rerender();

    const secondRenderCells = result.current;

    // renderCells function should be the same reference due to useCallback
    expect(firstRenderCells).toBe(secondRenderCells);
  });

  it("should handle zero-sized cells", () => {
    const range: VisibleRange = {
      firstRow: 0,
      lastRow: 1,
      firstColumn: 0,
      lastColumn: 1,
    };

    const { result } = renderHook(() =>
      useRenderCells(range, 0, 0, mockChildren)
    );

    const renderCells = result.current;
    const cells = renderCells();

    expect(cells).toHaveLength(4);
    expect(mockChildren).toHaveBeenCalledTimes(4);

    // All cells should have zero dimensions
    cells.forEach(cell => {
      if (React.isValidElement(cell)) {
        expect(cell.props.style.height).toBe(0);
        expect(cell.props.style.width).toBe(0);
      }
    });
  });
});
