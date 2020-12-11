import * as React from "react";
import {
  DraggableProvided,
  DraggableRubric,
  DraggableStateSnapshot,
  Droppable,
} from "react-beautiful-dnd";
import styled from "@emotion/styled";
import { BoardItem, Task } from "../board-item";
import * as types from "../../core/types";
import { FixedSizeList, areEqual, FixedSizeGrid } from "react-window";
import { useLayoutEffect, useRef } from "react";

// Define types for board column element properties
type BoardColumnProps = {
  key: string;
  column: types.Column;
  tasks: types.Task[];
  index: number;
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
  h2 {
    flex: 0 0 80%;
    /* padding: 2%; */
    border: 1px solid transparent;
    border-radius: 4px;
    font: 24px sans-serif;
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
export const BoardColumn: React.FC<BoardColumnProps> = React.memo((props) => {
  return (
    <BoardColumnWrapper>
      {/* Title of the column */}
      <BoardColumnTitle>
        <h2>{props.column.title}</h2>
      </BoardColumnTitle>

      <Droppable
        droppableId={props.column.id}
        mode="virtual"
        renderClone={(
          provided: DraggableProvided,
          snapshot: DraggableStateSnapshot,
          rubric: DraggableRubric
        ) => (
          <Task
            provided={provided}
            isDragging={snapshot.isDragging}
            task={props.tasks[rubric.source.index]}
          />
        )}
      >
        {(provided, snapshot) => {
          const itemCount: number = snapshot.isUsingPlaceholder
            ? props.tasks.length + 1
            : props.tasks.length;

          return (
            <FixedSizeList
              height={600}
              itemCount={itemCount}
              itemSize={110}
              width={300}
              outerRef={provided.innerRef}
              style={{
                backgroundColor: getBackgroundColor(snapshot.isDraggingOver),
                transition: "background-color 0.2s ease",
                // We add this spacing so that when we drop into an empty list we will animate to the correct visual position.
                // padding: grid,
              }}
              itemData={props.tasks}
            >
              {BoardItem}
            </FixedSizeList>
          );
        }}
      </Droppable>
    </BoardColumnWrapper>
  );
});
