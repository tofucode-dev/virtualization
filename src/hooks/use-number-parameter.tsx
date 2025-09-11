import { useCallback, useState } from "react";

/**
 * Custom hook for managing number input state with string display and numeric value.
 *
 * This hook provides a convenient way to handle number inputs where you need to:
 * - Display the raw string value in the input field
 * - Maintain a parsed numeric value for calculations
 * - Validate input to only allow digits
 *
 * @param initialValue - The initial numeric value to start with
 * @returns A tuple containing:
 *   - input: The current string value to display in the input field
 *   - param: The current parsed numeric value
 *   - onChangeParam: Event handler for input changes that validates and updates both values
 *
 * @example
 * ```tsx
 * const [input, value, onChange] = useNumberParameter(5);
 *
 * return (
 *   <input
 *     value={input}
 *     onChange={onChange}
 *   />
 * );
 * ```
 */
export const useNumberParameter = (
  initialValue: number
): [
  string,
  number,
  React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>,
] => {
  const [input, setInput] = useState(initialValue.toString());
  const [param, setParam] = useState(initialValue);

  const onChangeParam = useCallback<
    React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >(({ target: { value } }) => {
    if (/^\d*$/.test(value)) {
      setInput(value);
      if (value) {
        setParam(Number(value));
      }
    }
  }, []);

  return [input, param, onChangeParam];
};
