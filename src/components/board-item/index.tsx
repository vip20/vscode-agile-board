import * as React from "react";
import { Draggable } from "react-beautiful-dnd";
import styled from "@emotion/styled";
import * as types from "../../core/types";

// Define types for board item element properties
type BoardItemProps = {
  index: number;
  style: any;
  data: types.Task[];
};

// Define types for board item element style properties
// This is necessary for TypeScript to accept the 'isDragging' prop.
type BoardItemStylesProps = {
  isDragging: boolean;
};

// Create style for board item element
export const BoardItemEl = styled.div<BoardItemStylesProps>`
  background-color: ${(props) =>
    props.isDragging
      ? "var(--vscode-editorGroup-dropBackground)"
      : "var(--vscode-tab-inactiveBackground)"};
  border-radius: 4px;
  transition: background-color 0.25s ease-out;
  border: 1px solid transparent;

  &:hover {
    background-color: var(--vscode-editorGroupHeader-tabsBackground);
    border-color: var(--vscode-editor-foreground);
  }

  /* & + & {
    margin-top: 4px;
  } */
`;

// Create and export the BoardItem component
export const BoardItem = React.memo(
  ({ data, index, style }: BoardItemProps) => {
    const task: types.Task = data[index];
    if (!task) {
      return null;
    }
    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <Task
            provided={provided}
            isDragging={snapshot.isDragging}
            task={task}
            style={style}
          />
        )}
      </Draggable>
    );
  }
);

export function Task({ provided, task, style, isDragging }: any) {
  return (
    <BoardItemEl
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
      isDragging={isDragging}
      style={getStyle({
        draggableStyle: provided.draggableProps.style,
        virtualStyle: style,
        isDragging,
      })}
    >
      {/* The content of the BoardItem */}
      <h3>{task.description}</h3>
    </BoardItemEl>
  );
}

function getStyle({ draggableStyle, virtualStyle, isDragging }: any) {
  const combined = {
    ...virtualStyle,
    ...draggableStyle,
  };

  const grid = 8;
  // when dragging we want to use the draggable style for placement, otherwise use the virtual style
  const result = {
    ...combined,

    left: combined.left + grid,
    top: combined.top + grid,
    height: combined.height - grid,
    width: isDragging
      ? draggableStyle.width
      : `calc(${combined.width} - ${grid * 2.25}px)`,
  };

  return result;
}
