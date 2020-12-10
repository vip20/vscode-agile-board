import * as React from "react";
import { Draggable } from "react-beautiful-dnd";
import styled from "@emotion/styled";
import { Task } from "../../core/types";

// Define types for board item element properties
type BoardItemProps = {
  index: number;
  style: Object;
  data: Task[];
};

// Define types for board item element style properties
// This is necessary for TypeScript to accept the 'isDragging' prop.
type BoardItemStylesProps = {
  isDragging: boolean;
};

// Create style for board item element
export const BoardItemEl = styled.div<BoardItemStylesProps>`
  padding: 8px;
  min-height: 100px;
  margin-bottom: 12px;
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

  & + & {
    margin-top: 4px;
  }
`;

// Create and export the BoardItem component
export const BoardItem = React.memo(
  ({ data, index, style }: BoardItemProps) => {
    const task: Task = data[index];
    if (!task) {
      return null;
    }
    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <BoardItemEl
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            isDragging={snapshot.isDragging}
          >
            {/* The content of the BoardItem */}
            <h3>{task.description}</h3>
          </BoardItemEl>
        )}
      </Draggable>
    );
  }
);
