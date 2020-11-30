import * as React from "react";
import { Draggable } from "react-beautiful-dnd";
import styled from "@emotion/styled";

// Define types for board item element properties
type BoardItemProps = {
  index: number;
  item: any;
};

// Define types for board item element style properties
// This is necessary for TypeScript to accept the 'isDragging' prop.
type BoardItemStylesProps = {
  isDragging: boolean;
};

// Create style for board item element
const BoardItemEl = styled.div<BoardItemStylesProps>`
  padding: 8px;
  background-color: ${(props) => (props.isDragging ? "#d3e4ee" : "#fff")};
  border-radius: 4px;
  transition: background-color 0.25s ease-out;

  &:hover {
    background-color: #f7fafc;
  }

  & + & {
    margin-top: 4px;
  }
`;

// Create and export the BoardItem component
export default function BoardItem(props: BoardItemProps) {
  return (
    <Draggable draggableId={props.item.id} index={props.index}>
      {(provided, snapshot) => (
        <BoardItemEl
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          isDragging={snapshot.isDragging}
        >
          {/* The content of the BoardItem */}
          {props.item.content}
        </BoardItemEl>
      )}
    </Draggable>
  );
}
