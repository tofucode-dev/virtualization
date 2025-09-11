import { act, renderHook } from "@testing-library/react";
import React from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useVirtualization } from "../hooks/use-virtualization";
import { VirtualizerProps } from "../types/virtualization.types";

// Mock console methods to avoid noise in tests
const originalConsole = console;
beforeEach(() => {
  globalThis.console = {
    ...originalConsole,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
});

afterEach(() => {
  globalThis.console = originalConsole;
  vi.clearAllMocks();
});

describe("Virtualization Performance Tests", () => {
  const createMockProps = (
    overrides: Partial<VirtualizerProps> = {}
  ): VirtualizerProps => ({
    numRows: 1000,
    numColumns: 1000,
    rowHeight: 50,
    columnWidth: 100,
    containerHeight: 400,
    containerWidth: 500,
    overscanRowCount: 5,
    overscanColumnCount: 3,
    children: ({ rowIndex, columnIndex, style, key }) =>
      React.createElement("div", { key, style }, `${rowIndex}:${columnIndex}`),
    ...overrides,
  });

  describe("Initialization Performance", () => {
    it("should initialize quickly with large datasets", () => {
      const props = createMockProps({
        numRows: 10000,
        numColumns: 10000,
      });

      const startTime = performance.now();
      const { result } = renderHook(() => useVirtualization(props));
      const endTime = performance.now();

      const initTime = endTime - startTime;

      // Should complete initialization quickly (under 100ms for large datasets)
      expect(initTime).toBeLessThan(100);
      expect(result.current).toBeDefined();
      expect(result.current.totalHeight).toBe(500000); // 10000 * 50
      expect(result.current.totalWidth).toBe(1000000); // 10000 * 100
    });

    it("should handle very large datasets without memory issues", () => {
      const props = createMockProps({
        numRows: 100000,
        numColumns: 100000,
      });

      // This should not throw or cause memory issues
      expect(() => {
        const { result } = renderHook(() => useVirtualization(props));
        expect(result.current.totalHeight).toBe(5000000); // 100000 * 50
        expect(result.current.totalWidth).toBe(10000000); // 100000 * 100
      }).not.toThrow();
    });
  });

  describe("Rendering Performance", () => {
    it("should render only visible cells efficiently", () => {
      const props = createMockProps({
        numRows: 1000,
        numColumns: 1000,
        containerHeight: 400,
        containerWidth: 500,
      });

      const { result } = renderHook(() => useVirtualization(props));
      const { renderCells } = result.current;

      const startTime = performance.now();
      const cells = renderCells();
      const endTime = performance.now();

      const renderTime = endTime - startTime;

      // Should render quickly (under 5ms)
      expect(renderTime).toBeLessThan(5);

      // Should render only a small number of cells (visible + overscan)
      // With container 400x500 and cell size 50x100, we expect ~8 rows and ~5 columns
      // Plus overscan, should be around 10-15 rows and 8-10 columns = ~80-150 cells
      expect(cells.length).toBeLessThan(200);
      expect(cells.length).toBeGreaterThan(50);

      // Each cell should be a valid React element
      cells.forEach(cell => {
        expect(React.isValidElement(cell)).toBe(true);
      });
    });

    it("should maintain consistent rendering performance across multiple calls", () => {
      const props = createMockProps();
      const { result } = renderHook(() => useVirtualization(props));
      const { renderCells } = result.current;

      const renderTimes: number[] = [];

      // Measure multiple render calls
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        const cells = renderCells();
        const endTime = performance.now();

        renderTimes.push(endTime - startTime);

        // Each render should produce the same number of cells
        expect(cells.length).toBeGreaterThan(0);
      }

      // All render times should be consistent (within 2ms variance)
      const avgTime =
        renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      renderTimes.forEach(time => {
        expect(Math.abs(time - avgTime)).toBeLessThan(2);
      });
    });
  });

  describe("Scroll Performance", () => {
    it("should handle rapid scroll events efficiently", () => {
      const props = createMockProps();
      const { result } = renderHook(() => useVirtualization(props));
      const { onScroll } = result.current;

      const mockScrollContainer = {
        scrollTop: 0,
        scrollLeft: 0,
      };

      const startTime = performance.now();

      // Simulate rapid scrolling
      for (let i = 0; i < 100; i++) {
        mockScrollContainer.scrollTop = i * 10;
        mockScrollContainer.scrollLeft = i * 5;

        act(() => {
          onScroll({ currentTarget: mockScrollContainer } as any);
        });
      }

      const endTime = performance.now();
      const scrollTime = endTime - startTime;

      // Should handle all scroll events efficiently (under 50ms for 100 events)
      expect(scrollTime).toBeLessThan(50);
      expect(mockScrollContainer.scrollTop).toBe(990); // 99 * 10
      expect(mockScrollContainer.scrollLeft).toBe(495); // 99 * 5
    });
  });

  describe("Memory Performance", () => {
    it("should not create excessive DOM elements", () => {
      const props = createMockProps({
        numRows: 10000,
        numColumns: 10000,
        containerHeight: 400,
        containerWidth: 500,
      });

      const { result } = renderHook(() => useVirtualization(props));
      const { renderCells } = result.current;

      const cells = renderCells();

      // Should only create cells for visible area + overscan
      // Not for the entire 10000x10000 grid
      expect(cells.length).toBeLessThan(500); // Much less than 10000x10000
      expect(cells.length).toBeGreaterThan(50); // But still reasonable for visible area
    });

    it("should handle multiple hook instances efficiently", () => {
      const props1 = createMockProps({ numRows: 1000, numColumns: 1000 });
      const props2 = createMockProps({ numRows: 2000, numColumns: 2000 });
      const props3 = createMockProps({ numRows: 5000, numColumns: 5000 });

      // Create multiple hook instances
      const { result: result1 } = renderHook(() => useVirtualization(props1));
      const { result: result2 } = renderHook(() => useVirtualization(props2));
      const { result: result3 } = renderHook(() => useVirtualization(props3));

      // All should work independently without interference
      expect(result1.current.totalHeight).toBe(50000); // 1000 * 50
      expect(result2.current.totalHeight).toBe(100000); // 2000 * 50
      expect(result3.current.totalHeight).toBe(250000); // 5000 * 50

      // All should render cells efficiently
      const cells1 = result1.current.renderCells();
      const cells2 = result2.current.renderCells();
      const cells3 = result3.current.renderCells();

      expect(cells1.length).toBeLessThan(200);
      expect(cells2.length).toBeLessThan(200);
      expect(cells3.length).toBeLessThan(200);
    });
  });

  describe("Edge Cases Performance", () => {
    it("should handle zero dimensions efficiently", () => {
      const props = createMockProps({
        numRows: 0,
        numColumns: 0,
        containerHeight: 0,
        containerWidth: 0,
      });

      const { result } = renderHook(() => useVirtualization(props));

      expect(result.current.totalHeight).toBe(0);
      expect(result.current.totalWidth).toBe(0);

      const cells = result.current.renderCells();
      expect(cells.length).toBe(0);
    });

    it("should handle single cell efficiently", () => {
      const props = createMockProps({
        numRows: 1,
        numColumns: 1,
      });

      const { result } = renderHook(() => useVirtualization(props));

      expect(result.current.totalHeight).toBe(50);
      expect(result.current.totalWidth).toBe(100);

      const cells = result.current.renderCells();
      expect(cells.length).toBe(1);
    });
  });
});
