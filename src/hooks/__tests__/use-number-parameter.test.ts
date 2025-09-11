import { act, renderHook } from "@testing-library/react";

import { describe, expect, it } from "vitest";

import { useNumberParameter } from "../use-number-parameter";

describe("useNumberParameter", () => {
  it("should initialize with the provided initial value", () => {
    const { result } = renderHook(() => useNumberParameter(42));
    const [input, param] = result.current;

    expect(input).toBe("42");
    expect(param).toBe(42);
  });

  it("should initialize with zero when provided", () => {
    const { result } = renderHook(() => useNumberParameter(0));
    const [input, param] = result.current;

    expect(input).toBe("0");
    expect(param).toBe(0);
  });

  it("should update both input and param when valid number is entered", () => {
    const { result } = renderHook(() => useNumberParameter(0));
    const [, , onChangeParam] = result.current;

    act(() => {
      onChangeParam({ target: { value: "123" } } as any);
    });

    const [input, param] = result.current;
    expect(input).toBe("123");
    expect(param).toBe(123);
  });

  it("should update input but not param when empty string is entered", () => {
    const { result } = renderHook(() => useNumberParameter(42));
    const [, , onChangeParam] = result.current;

    act(() => {
      onChangeParam({ target: { value: "" } } as any);
    });

    const [input, param] = result.current;
    expect(input).toBe("");
    expect(param).toBe(42); // Should remain unchanged
  });

  it("should reject non-numeric input", () => {
    const { result } = renderHook(() => useNumberParameter(42));
    const [, , onChangeParam] = result.current;

    act(() => {
      onChangeParam({ target: { value: "abc" } } as any);
    });

    const [input, param] = result.current;
    expect(input).toBe("42"); // Should remain unchanged
    expect(param).toBe(42); // Should remain unchanged
  });

  it("should reject input with special characters", () => {
    const { result } = renderHook(() => useNumberParameter(42));
    const [, , onChangeParam] = result.current;

    act(() => {
      onChangeParam({ target: { value: "12.34" } } as any);
    });

    const [input, param] = result.current;
    expect(input).toBe("42"); // Should remain unchanged
    expect(param).toBe(42); // Should remain unchanged
  });

  it("should reject input with spaces", () => {
    const { result } = renderHook(() => useNumberParameter(42));
    const [, , onChangeParam] = result.current;

    act(() => {
      onChangeParam({ target: { value: "12 34" } } as any);
    });

    const [input, param] = result.current;
    expect(input).toBe("42"); // Should remain unchanged
    expect(param).toBe(42); // Should remain unchanged
  });

  it("should accept leading zeros", () => {
    const { result } = renderHook(() => useNumberParameter(0));
    const [, , onChangeParam] = result.current;

    act(() => {
      onChangeParam({ target: { value: "007" } } as any);
    });

    const [input, param] = result.current;
    expect(input).toBe("007");
    expect(param).toBe(7);
  });

  it("should handle multiple valid changes", () => {
    const { result } = renderHook(() => useNumberParameter(0));
    const [, , onChangeParam] = result.current;

    act(() => {
      onChangeParam({ target: { value: "1" } } as any);
    });

    expect(result.current[0]).toBe("1");
    expect(result.current[1]).toBe(1);

    act(() => {
      onChangeParam({ target: { value: "12" } } as any);
    });

    expect(result.current[0]).toBe("12");
    expect(result.current[1]).toBe(12);

    act(() => {
      onChangeParam({ target: { value: "123" } } as any);
    });

    expect(result.current[0]).toBe("123");
    expect(result.current[1]).toBe(123);
  });

  it("should handle large numbers", () => {
    const { result } = renderHook(() => useNumberParameter(0));
    const [, , onChangeParam] = result.current;

    act(() => {
      onChangeParam({ target: { value: "999999999" } } as any);
    });

    const [input, param] = result.current;
    expect(input).toBe("999999999");
    expect(param).toBe(999999999);
  });

  it("should maintain referential stability of onChangeParam", () => {
    const { result, rerender } = renderHook(() => useNumberParameter(42));
    const [, , onChangeParam1] = result.current;

    rerender();

    const [, , onChangeParam2] = result.current;
    expect(onChangeParam1).toBe(onChangeParam2);
  });

  it("should work with HTMLInputElement and HTMLTextAreaElement", () => {
    const { result } = renderHook(() => useNumberParameter(0));
    const [, , onChangeParam] = result.current;

    // Test with input element
    const inputElement = document.createElement("input");
    inputElement.value = "456";

    act(() => {
      onChangeParam({ target: inputElement } as any);
    });

    expect(result.current[0]).toBe("456");
    expect(result.current[1]).toBe(456);

    // Test with textarea element
    const textareaElement = document.createElement("textarea");
    textareaElement.value = "789";

    act(() => {
      onChangeParam({ target: textareaElement } as any);
    });

    expect(result.current[0]).toBe("789");
    expect(result.current[1]).toBe(789);
  });
});
