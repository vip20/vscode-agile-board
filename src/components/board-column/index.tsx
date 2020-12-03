import * as React from "react";
import { Droppable } from "react-beautiful-dnd";
import styled from "@emotion/styled";
import BoardItem from "../board-item";
import { Column, Task } from "../../core/types";

// Define types for board column element properties
type BoardColumnProps = {
  key: string;
  column: Column;
  tasks: Task[];
};

// Define types for board column content style properties
// This is necessary for TypeScript to accept the 'isDraggingOver' prop.
type BoardColumnContentStylesProps = {
  isDraggingOver: boolean;
};

// Create styles for BoardColumnWrapper element
const BoardColumnWrapper = styled.div`
  flex: 1;
  padding: 8px;
  background-color: #e5eff5;
  border-radius: 4px;

  & + & {
    margin-left: 12px;
  }
`;

// Create styles for BoardColumnTitle element
const BoardColumnTitle = styled.h2`
  font: 14px sans-serif;
  margin-bottom: 12px;
`;

// Create styles for BoardColumnContent element
const BoardColumnContent = styled.div<BoardColumnContentStylesProps>`
  min-height: 20px;
  background-color: ${(props) => (props.isDraggingOver ? "#aecde0" : null)};
  border-radius: 4px;
`;

// Create and export the BoardColumn component
export const BoardColumn: React.FC<BoardColumnProps> = (props) => {
  return (
    <BoardColumnWrapper>
      {/* Title of the column */}
      <BoardColumnTitle>{props.column.title}</BoardColumnTitle>

      <Droppable droppableId={props.column.id}>
        {(provided, snapshot) => (
          <BoardColumnContent
            {...provided.droppableProps}
            ref={provided.innerRef}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {/* All board items belong into specific column. */}
            {props.tasks.map((task: any, index: number) => (
              <BoardItem key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </BoardColumnContent>
        )}
      </Droppable>
    </BoardColumnWrapper>
  );
};
