import * as React from "react";
import {
  Draggable,
  DraggableProvided,
  DraggableRubric,
  DraggableStateSnapshot,
  Droppable,
} from "react-beautiful-dnd";
import styled from "@emotion/styled";
import { BoardItem, Task } from "../board-item";
import * as types from "../../core/types";
import { FixedSizeList, areEqual, FixedSizeGrid } from "react-window";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import InputBox from "../input-box";
import useResponsive from "../../hooks/useResponsive";

const ColumnTitle = styled.h2`
  text-align: left;
  height: 37px;
`;
// Define types for board column element properties
type BoardColumnProps = {
  key: string;
  column: types.Column;
  tasks: types.Task[];
  index: number;
  columnNames: string[];
  applyChange: Function;
};

// Create styles for BoardColumnWrapper element
const BoardColumnWrapper = styled.div`
  /* flex: 1; */
  padding: 8px 0;
  /* background-color: var(--vscode-editorGroup-dropBackground); */
  background-color: #3c3c3c3d;
  /* background: none; */
  border-radius: 4px;
  min-width: 300px;
  overflow-x: hidden;
  overflow-y: auto;

  & + & {
    margin-left: 12px;
  }
`;

// Create styles for BoardColumnTitle element
const BoardColumnTitle = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  h2 {
    flex: 0 0 80%;
    /* padding: 2%; */
    border: 1px solid transparent;
    border-radius: 4px;
    font: 20px sans-serif;
    font-weight: 600;
    cursor: default;
  }
`;

function getBackgroundColor(isDraggingOver: boolean) {
  return isDraggingOver
    ? "var(--vscode-editorGroup-dropBackground)"
    : "transparent";
}

// Create and export the BoardColumn component
export const BoardColumn: React.FC<BoardColumnProps> = React.memo(
  ({ column, index, tasks, columnNames, applyChange }: BoardColumnProps) => {
    const [nameErrMsg, setNameErrMsg] = useState("");
    const [columnName, setColumnName] = useState("");

    useEffect(() => {
      const filteredDir: string[] = columnNames.filter(
        (x: string) => x !== column.title
      );
      if (filteredDir.indexOf(columnName) !== -1) {
        setNameErrMsg(`Column by name "${columnName}" already exists.`);
      } else {
        setNameErrMsg("");
      }
    }, [columnName, columnNames]);
    return (
      <Draggable draggableId={column.id} key={column.id} index={index}>
        {(provided) => (
          <BoardColumnWrapper
            {...provided.draggableProps}
            ref={provided.innerRef}
          >
            <BoardColumnTitle {...provided.dragHandleProps}>
              <ColumnTitle>
                <InputBox
                  title="Enter Column Name"
                  value={column.title}
                  errMsg={nameErrMsg}
                  onChange={(e: string) => setColumnName(e)}
                  applyChange={(e: string) => applyChange(e)}
                  textAlign="left"
                ></InputBox>
              </ColumnTitle>
            </BoardColumnTitle>

            <TaskList column={column} index={index} tasks={tasks} />
          </BoardColumnWrapper>
        )}
      </Draggable>
    );
  }
);

const TaskList = React.memo(({ column, index, tasks }: any) => {
  const { height } = useResponsive();
  const listRef = useRef<any>();
  useLayoutEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTo(0);
    }
  }, [index]);

  return (
    <Droppable
      droppableId={column.id}
      mode="virtual"
      renderClone={(provided, snapshot, rubric) => (
        <Task
          provided={provided}
          isDragging={snapshot.isDragging}
          task={tasks[rubric.source.index]}
        />
      )}
    >
      {(provided, snapshot) => {
        const itemCount = snapshot.isUsingPlaceholder
          ? tasks.length + 1
          : tasks.length;
        return (
          <FixedSizeList
            height={height - 180}
            itemCount={itemCount}
            itemSize={110}
            width={300}
            outerRef={provided.innerRef}
            itemData={tasks}
            ref={listRef}
            style={{
              backgroundColor: getBackgroundColor(snapshot.isDraggingOver),
              transition: "background-color 0.2s ease",
            }}
          >
            {BoardItem}
          </FixedSizeList>
        );
      }}
    </Droppable>
  );
});
