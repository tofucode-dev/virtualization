import React from "react";

import styled from "styled-components";

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TextField = React.memo<{
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}>(({ label, value, onChange }) => (
  <Root>
    <label htmlFor={label}>{label}</label>
    <input name={label} value={value} onChange={onChange} />
  </Root>
));
