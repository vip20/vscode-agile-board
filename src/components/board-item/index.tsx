import * as React from "react";
import { Draggable } from "react-beautiful-dnd";
import styled from "@emotion/styled";
import * as t from "../../core/types";
import { areEqual } from "react-window";
import InputBox from "../input-box";
const moment = require("moment");
// Define types for board item element properties
type BoardItemProps = {
  index: number;
  style: any;
  data: { tasks: t.Task[]; editTask: Function };
};

// Define types for board item element style properties
// This is necessary for TypeScript to accept the 'isDragging' prop.
type BoardItemStylesProps = {
  isDragging: boolean;
};

export const TaskCard = styled.div`
  margin: 4px;
  height: 100%;
  width: 100%;
`;
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
    border-color: var(--vscode-tab-inactiveBackground);
  }

  /* & + & {
    margin-top: 4px;
  } */
`;

// Create and export the BoardItem component
export const BoardItem = React.memo(
  ({ data, index, style }: BoardItemProps) => {
    const task: t.Task = data.tasks[index];
    if (!task) {
      return null;
    }

    return (
      <Draggable draggableId={task.id} key={task.id} index={index}>
        {(provided, snapshot) => (
          <Task
            provided={provided}
            isDragging={snapshot.isDragging}
            task={task}
            style={style}
            data={data}
          />
        )}
      </Draggable>
    );
  },
  areEqual
);

export function Task({ provided, task, style, isDragging, data }: any) {
  function editTaskByKey(value: string, type: string) {
    const clonedTask = { ...task };
    clonedTask[type] = value;
    clonedTask.modifiedDate = moment().toISOString();
    data.editTask(task.id, clonedTask);
  }
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
      <TaskCard>
        <h4>
          <InputBox
            title="Edit Task Title"
            value={task.title}
            onChange={(e: string) => {}}
            applyChange={(e: string) => editTaskByKey(e, "title")}
            textAlign="left"
          ></InputBox>
        </h4>
      </TaskCard>
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
    height: isDragging ? combined.height : combined.height - grid,
    left: isDragging ? combined.left : combined.left + grid,
    width: isDragging
      ? draggableStyle.width
      : `calc(${combined.width} - ${grid * 2}px)`,
    marginBottom: grid,
  };

  return result;
}
