import * as React from "react";
import { useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import styled from "@emotion/styled";
import { BoardColumn } from "../board-column";
import { defaultBoardConfig } from "../../core/constants";
import { Column } from "../../core/types";

// Create styles board element properties
const BoardEl = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

export default function Board() {
  // Initialize board state with board data
  const [boardData, setBoardData] = useState(defaultBoardConfig);

  // Handle drag & drop
  function onDragEnd(result: any) {
    const { source, destination, draggableId } = result;

    // Do nothing if item is dropped outside the list
    if (!destination) {
      return;
    }

    // Do nothing if the item is dropped into the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find column from which the item was dragged from
    const columnStart = (boardData.columns as any)[source.droppableId];

    // Find column in which the item was dropped
    const columnFinish = (boardData.columns as any)[destination.droppableId];

    // Moving items in the same list
    if (columnStart === columnFinish) {
      // Get all item ids in currently active list
      const newItemsIds = Array.from(columnStart.itemsIds);

      // Remove the id of dragged item from its original position
      newItemsIds.splice(source.index, 1);

      // Insert the id of dragged item to the new position
      newItemsIds.splice(destination.index, 0, draggableId);

      // Create new, updated, object with data for columns
      const newColumnStart = {
        ...columnStart,
        itemsIds: newItemsIds,
      };

      // Create new board state with updated data for columns
      const newState = {
        ...boardData,
        columns: {
          ...boardData.columns,
          [newColumnStart.id]: newColumnStart,
        },
      };

      // Update the board state with new data
      setBoardData(newState);
    } else {
      // Moving items from one list to another
      // Get all item ids in source list
      const newStartItemsIds = Array.from(columnStart.itemsIds);

      // Remove the id of dragged item from its original position
      newStartItemsIds.splice(source.index, 1);

      // Create new, updated, object with data for source column
      const newColumnStart = {
        ...columnStart,
        itemsIds: newStartItemsIds,
      };

      // Get all item ids in destination list
      const newFinishItemsIds = Array.from(columnFinish.itemsIds);

      // Insert the id of dragged item to the new position in destination list
      newFinishItemsIds.splice(destination.index, 0, draggableId);

      // Create new, updated, object with data for destination column
      const newColumnFinish = {
        ...columnFinish,
        itemsIds: newFinishItemsIds,
      };

      // Create new board state with updated data for both, source and destination columns
      const newState = {
        ...boardData,
        columns: {
          ...boardData.columns,
          [newColumnStart.id]: newColumnStart,
          [newColumnFinish.id]: newColumnFinish,
        },
      };

      // Update the board state with new data
      setBoardData(newState);
    }
  }

  return (
    <BoardEl>
      {/* Create context for drag & drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Get all columns in the order specified in 'board-initial-data.ts' */}
        {boardData.columnsOrder.map((columnId: any) => {
          // Get id of the current column
          const column: Column = (boardData.columns as any)[columnId];

          // Get item belonging to the current column
          const tasks = column.tasksIds.map(
            (taskId: string) => (boardData.tasks as any)[taskId]
          );

          // Render the BoardColumn component
          return <BoardColumn key={column.id} column={column} tasks={tasks} />;
        })}
      </DragDropContext>
    </BoardEl>
  );
}
