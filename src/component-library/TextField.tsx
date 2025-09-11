import React from "react";

import styled from "styled-components";
import { TextFieldProps } from "../types/virtualization.types";

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

/**
 * TextField component for input fields.
 * 
 * This component is a memoized wrapper around an input field with a label.
 * It displays a label and an input field with the provided value and onChange handler.
 * 
 * @param label - The label for the input field
 * @param value - The current value of the input field
 * @param onChange - The onChange handler for the input field
 * @returns A memoized TextField component
 */

export const TextField = React.memo<TextFieldProps>(({ label, value, onChange }) => (
  <Root>
    <label htmlFor={label}> {label}</label>
    <input name={label} value={value} onChange={onChange} />
  </Root>
));
