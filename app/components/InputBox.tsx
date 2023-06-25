import * as React from 'react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { VscEdit } from 'react-icons/vsc';

type InputBoxStyleProps = {
  isError: boolean;
  textAlign: string | undefined;
};
export const InputBoxContainer = styled.div`
  .edit-icon {
    vertical-align: middle;
    visibility: hidden;
    cursor: pointer;
    font-size: 0.7em !important;
    padding-top: 0.3em;
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
    max-width: 100%;
    display: inline-flex;
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
export const AgileInput = styled.input<InputBoxStyleProps>`
  background-color: ${(props: any) =>
    props.isError
      ? 'var(--vscode-inputValidation-errorBackground)'
      : 'var(--vscode-input-background)'};
  color: ${(props: any) =>
    props.isError
      ? 'var(--vscode-inputValidation-errorForeground)'
      : 'var(--vscode-input-foreground)'};
  font-size: 0.8em;
  border: ${(props: any) => (props.isError ? 'var(--vscode-inputValidation-errorBorder)' : 'none')};
  text-align: ${(props: any) => (props.textAlign ? props.textAlign : 'center')};
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
  textAlign?: string;
  onChange: Function;
  applyChange: Function;
};

export default function InputBox({
  value,
  title,
  errMsg,
  onChange,
  applyChange,
  textAlign,
}: InputBoxProps) {
  const info = 'Hit Enter to Save';
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

  function handleEnterKeyDown(event: React.KeyboardEvent<HTMLInputElement>, callback: Function) {
    if (event.key === 'Enter') {
      if (!err) {
        callback();
      } else {
        setState(value);
        callback();
      }
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

  function onEdit(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
    e.stopPropagation();
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
            textAlign={textAlign}
            onChange={(e: any) => valueChange(e.target.value)}
            onKeyDown={(e: any) => handleEnterKeyDown(e, () => updateValue(state))}
            onBlur={() => {
              updateValue(state);
            }}
          />{' '}
          {<div className="input-error">{err || info}</div>}
        </>
      ) : (
        <span className="display">
          <div className="text" title={state}>
            {state}
          </div>
          <span className="edit-icon" title={placeHolder} onClick={e => onEdit(e)}>
            <VscEdit />
          </span>
        </span>
      )}
    </InputBoxContainer>
  );
}
