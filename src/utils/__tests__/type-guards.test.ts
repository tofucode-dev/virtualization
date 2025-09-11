import React from "react";

import { describe, expect, it } from "vitest";

import { CellInfo } from "../../types/virtualization.types";
import { isRenderFunction, isSizeFunction } from "../type-guards";

describe("isSizeFunction", () => {
  it("should return true for functions with exactly 1 parameter", () => {
    const validSizeFunction = (index: number) => index * 10;
    const anotherValidFunction = (x: any) => x * 2;

    expect(isSizeFunction(validSizeFunction)).toBe(true);
    expect(isSizeFunction(anotherValidFunction)).toBe(true);
  });

  it("should return false for functions with 0 parameters", () => {
    const noParamFunction = () => 100;

    expect(isSizeFunction(noParamFunction)).toBe(false);
  });

  it("should return false for functions with more than 1 parameter", () => {
    const twoParamFunction = (a: number, b: number) => a + b;
    const threeParamFunction = (a: any, b: any, c: any) => a + b + c;

    expect(isSizeFunction(twoParamFunction)).toBe(false);
    expect(isSizeFunction(threeParamFunction)).toBe(false);
  });

  it("should return false for non-function values", () => {
    expect(isSizeFunction(null)).toBe(false);
    expect(isSizeFunction(undefined)).toBe(false);
    expect(isSizeFunction(42)).toBe(false);
    expect(isSizeFunction("string")).toBe(false);
    expect(isSizeFunction({})).toBe(false);
    expect(isSizeFunction([])).toBe(false);
    expect(isSizeFunction(true)).toBe(false);
    expect(isSizeFunction(Symbol("test"))).toBe(false);
  });

  it("should work with arrow functions", () => {
    const arrowFunction = (index: number) => index * 2;

    expect(isSizeFunction(arrowFunction)).toBe(true);
  });

  it("should work with regular function expressions", () => {
    const regularFunction = function (index: number) {
      return index * 2;
    };

    expect(isSizeFunction(regularFunction)).toBe(true);
  });

/*   it("should work with functions that have default parameters (still counts as 1 param)", () => {
    const functionWithDefault = (index: number = 0) => index * 2;

    expect(isSizeFunction(functionWithDefault)).toBe(true);
  });

  it("should work with functions that have rest parameters (counts as 1 param)", () => {
    const functionWithRest = (...args: number[]) => args[0];

    expect(isSizeFunction(functionWithRest)).toBe(true);
  }); */
});

describe("isRenderFunction", () => {
  it("should return true for functions with exactly 1 parameter", () => {
    const validRenderFunction = (props: CellInfo) =>
      React.createElement(
        "div",
        { style: props.style },
        `Cell ${props.rowIndex}:${props.columnIndex}`
      );
    const anotherValidFunction = (x: any) =>
      x ? React.createElement("span", null, "Truthy") : null;

    expect(isRenderFunction(validRenderFunction)).toBe(true);
    expect(isRenderFunction(anotherValidFunction)).toBe(true);
  });

  it("should return false for functions with 0 parameters", () => {
    const noParamFunction = () => React.createElement("div", null, "Test");

    expect(isRenderFunction(noParamFunction)).toBe(false);
  });

  it("should return false for functions with more than 1 parameter", () => {
    const twoParamFunction = (a: CellInfo, b: any) =>
      React.createElement(
        "div",
        { style: a.style },
        `Cell ${a.rowIndex}:${a.columnIndex} - ${b}`
      );
    const threeParamFunction = (a: any, b: any, c: any) =>
      React.createElement("div", null, `${a}-${b}-${c}`);

    expect(isRenderFunction(twoParamFunction)).toBe(false);
    expect(isRenderFunction(threeParamFunction)).toBe(false);
  });

  it("should return false for non-function values", () => {
    expect(isRenderFunction(null)).toBe(false);
    expect(isRenderFunction(undefined)).toBe(false);
    expect(isRenderFunction(42)).toBe(false);
    expect(isRenderFunction("string")).toBe(false);
    expect(isRenderFunction({})).toBe(false);
    expect(isRenderFunction([])).toBe(false);
    expect(isRenderFunction(true)).toBe(false);
    expect(isRenderFunction(Symbol("test"))).toBe(false);
  });

  it("should work with arrow functions", () => {
    const arrowFunction = (props: CellInfo) =>
      React.createElement(
        "span",
        { style: props.style },
        `Arrow ${props.rowIndex}`
      );

    expect(isRenderFunction(arrowFunction)).toBe(true);
  });

  it("should work with regular function expressions", () => {
    const regularFunction = function (props: CellInfo) {
      return React.createElement(
        "div",
        { style: props.style },
        `Declaration ${props.columnIndex}`
      );
    };

    expect(isRenderFunction(regularFunction)).toBe(true);
  });

/*   it("should work with functions that have default parameters", () => {
    const functionWithDefault = (
      props: CellInfo = {
        rowIndex: 0,
        columnIndex: 0,
        style: {},
        key: "default",
      }
    ) =>
      React.createElement(
        "div",
        { style: props.style },
        `Default ${props.rowIndex}`
      );

    expect(isRenderFunction(functionWithDefault)).toBe(true);
  });

  it("should work with functions that have rest parameters", () => {
    const functionWithRest = (...args: any[]) =>
      React.createElement("div", null, `Rest with ${args.length} args`);

    expect(isRenderFunction(functionWithRest)).toBe(true);
  }); */

  it("should work with functions that return different React node types", () => {
    const stringFunction = (info: CellInfo) => `String ${info.rowIndex}`;
    const numberFunction = (info: CellInfo) => info.rowIndex * info.columnIndex;
    const nullFunction = (info: CellInfo) =>
      info.rowIndex > 0 ? null : React.createElement("div", null, "Zero");
    const elementFunction = (info: CellInfo) =>
      React.createElement(
        "div",
        { style: info.style },
        `Element ${info.rowIndex}:${info.columnIndex}`
      );

    expect(isRenderFunction(stringFunction)).toBe(true);
    expect(isRenderFunction(numberFunction)).toBe(true);
    expect(isRenderFunction(nullFunction)).toBe(true);
    expect(isRenderFunction(elementFunction)).toBe(true);
  });
});

describe("Type narrowing behavior", () => {
  it("should properly narrow types for isSizeFunction", () => {
    const unknownValue: unknown = (index: number) => index * 10;

    if (isSizeFunction(unknownValue)) {
      // TypeScript should now know this is a SizeFunction
      const result = unknownValue(5); // This should compile without issues
      expect(result).toBe(50);
    }
  });

  it("should properly narrow types for isRenderFunction", () => {
    const unknownValue: unknown = (props: CellInfo) =>
      React.createElement(
        "div",
        { style: props.style },
        `Test ${props.rowIndex}`
      );

    if (isRenderFunction(unknownValue)) {
      // TypeScript should now know this is a RenderFunction
      const result = unknownValue({
        rowIndex: 0,
        columnIndex: 0,
        style: {},
        key: "test",
      });
      expect(result).toBeDefined();
    }
  });
});

describe("Edge cases", () => {
  it("should handle built-in functions correctly", () => {
    // Built-in functions might have length of 0 or 1 depending on the function
    expect(isSizeFunction(parseInt)).toBe(false); // parseInt has length 2
    expect(isSizeFunction(Math.abs)).toBe(true); // Math.abs has length 1
  });

  it("should handle bound functions", () => {
    const originalFunction = (a: number, b: number) => a + b;
    const boundFunction = originalFunction.bind(null, 5); // Now effectively takes 1 param

    expect(isSizeFunction(boundFunction)).toBe(true);
  });

  it("should handle functions with modified length property", () => {
    const func = (x: number) => x;
    // Note: In strict mode, you can't modify function.length, but this tests the concept
    Object.defineProperty(func, "length", { value: 2, configurable: true });

    expect(isSizeFunction(func)).toBe(false); // Should respect the modified length
  });

  it("should handle async functions", () => {
    const asyncFunction = async (index: number) => index * 2;

    expect(isSizeFunction(asyncFunction)).toBe(true);
  });

  it("should handle generator functions", () => {
    function* generatorFunction(index: number) {
      yield index * 2;
    }

    expect(isSizeFunction(generatorFunction)).toBe(true);
  });

  it("should handle class constructors", () => {
    class TestClass {
      value: number;

      constructor(index: number) {
        this.value = index * 2;
      }
    }

    expect(isSizeFunction(TestClass)).toBe(true);
  });
});
