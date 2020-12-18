import * as React from "react";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";

type BoardInputProps = {
  isError: boolean;
};
export const InputBoxContainer = styled.div`
  .edit-icon {
    vertical-align: middle;
    margin-left: 8px;
    visibility: hidden;
    cursor: pointer;
  }
  &:hover {
    .edit-icon {
      visibility: visible;
    }
  }
  .input-error {
    font-size: 10px !important;
    font-weight: 100;
    font-style: italic;
    transition: 0.28s;
    /* font-style: italic; */
    font-size: 16px;
  }
  .display {
    animation-name: appear;
    animation-duration: 1s;
  }
  @keyframes appear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
export const AgileInput = styled.input<BoardInputProps>`
  background-color: ${(props) =>
    props.isError
      ? "var(--vscode-inputValidation-errorBackground)"
      : "var(--vscode-input-background)"};
  color: ${(props) =>
    props.isError
      ? "var(--vscode-inputValidation-errorForeground)"
      : "var(--vscode-input-foreground)"};
  font-size: 0.8em;
  border: ${(props) =>
    props.isError ? "var(--vscode-inputValidation-errorBorder)" : "none"};
  text-align: center;
  &:focus {
    outline: none;
  }
  border-radius: 4px !important;
  width: 150px !important;
`;
export type InputBoxProps = {
  value: string;
  title: string;
  errMsg?: string;
  onChange: Function;
  applyChange: Function;
};

export default function InputBox({
  value,
  title,
  errMsg,
  onChange,
  applyChange,
}: InputBoxProps) {
  const info = "Hit Enter to Save";
  const [state, setState] = useState(value);
  const [placeHolder, setPlaceholder] = useState(title);
  const [err, setErr] = useState(errMsg);
  const [isEdit, setEdit] = useState(false);
  useEffect(() => {
    setState(value);
  }, [value]);
  useEffect(() => {
    setPlaceholder(title);
  }, [title]);
  useEffect(() => {
    setErr(errMsg);
  }, [errMsg]);

  function handleEnterKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    callback: Function
  ) {
    if (event.key === "Enter") {
      callback();
    }
  }

  function updateValue(currentValue: string) {
    setEdit(false);
    if (currentValue && !err) {
      applyChange(currentValue);
    } else {
      onChange(value);
    }
  }

  function onEdit() {
    setEdit(true);
    onChange(value);
  }

  function valueChange(value: string) {
    setState(value);
    onChange(value);
  }

  return (
    <InputBoxContainer>
      {isEdit ? (
        <>
          <AgileInput
            className="display"
            isError={!!err}
            type="text"
            autoFocus
            value={state}
            onChange={(e) => valueChange(e.target.value)}
            onKeyDown={(e) => handleEnterKeyDown(e, () => updateValue(state))}
          />{" "}
          {<div className="input-error">{err || info}</div>}
        </>
      ) : (
        <span className="display">
          {state}
          <span className="edit-icon" title={placeHolder} onClick={onEdit}>
            <AiOutlineEdit />
          </span>
        </span>
      )}
    </InputBoxContainer>
  );
}
