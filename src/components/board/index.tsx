import * as React from "react";
import { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import styled from "@emotion/styled";
import { BoardColumn } from "../board-column";
import { ACTION, defaultBoardConfig } from "../../core/constants";
import * as types from "../../core/types";

// Create styles board element properties
const BoardEl = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px;
`;

export default function Board({ configJson, vscodeApi }: any) {
  // Initialize board state with board data
  const [boardData, setBoardData] = useState(defaultBoardConfig);
  useEffect(() => {
    // Update board when configJson changes from input
    setBoardData(configJson);
    if (configJson !== defaultBoardConfig) {
      vscodeApi.setState(configJson);
    }
  }, [configJson]);

  useEffect(() => {
    let oldState = vscodeApi.getState();
    // when there is a state available use that to display webview works when tab changes
    if (oldState && oldState !== boardData) {
      setBoardData(oldState);
    }
  }, [vscodeApi]);

  function updateJsonConfig(data: types.Board, isInit: boolean = false) {
    vscodeApi.postMessage({
      action: ACTION.updateJson,
      board: data.boardName,
      data: data,
    });
    // Save state of the current webview;
    vscodeApi.setState(data);
    setBoardData(data);
  }

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
      const newTaskIds = Array.from(columnStart.tasksIds);
      // Remove the id of dragged item from its original position
      newTaskIds.splice(source.index, 1);
      // Insert the id of dragged item to the new position
      newTaskIds.splice(destination.index, 0, draggableId);
      // Create new, updated, object with data for columns
      const newColumnStart: types.Column = {
        ...columnStart,
        tasksIds: newTaskIds,
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
      updateJsonConfig(newState);
    } else {
      // Moving items from one list to another
      // Get all item ids in source list
      const newStartTaskIds = Array.from(columnStart.tasksIds);
      // Remove the id of dragged item from its original position
      newStartTaskIds.splice(source.index, 1);
      // Create new, updated, object with data for source column
      const newColumnStart: types.Column = {
        ...columnStart,
        tasksIds: newStartTaskIds,
      };
      // Get all item ids in destination list
      const newFinishTaskIds = Array.from(columnFinish.tasksIds);
      // Insert the id of dragged item to the new position in destination list
      newFinishTaskIds.splice(destination.index, 0, draggableId);
      // Create new, updated, object with data for destination column
      const newColumnFinish: types.Column = {
        ...columnFinish,
        tasksIds: newFinishTaskIds,
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
      updateJsonConfig(newState);
    }
  }

  return (
    <BoardEl>
      {/* Create context for drag & drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Get all columns in the order specified in 'board-initial-data.ts' */}
        {boardData.columnsOrder.map((columnId: any) => {
          // Get id of the current column
          const column: types.Column = (boardData.columns as any)[columnId];
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
