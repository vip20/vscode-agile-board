import * as React from "react";
import { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import styled from "@emotion/styled";
import { BoardColumn } from "../board-column";
import { ACTION, defaultBoardConfig } from "../../core/constants";
import * as types from "../../core/types";
import { AiOutlineEdit } from "react-icons/ai";
import { reorderList } from "../../core/helpers";

type BoardInputProps = {
  isError: boolean;
};
// Create styles board element properties
const BoardEl = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 12px;
`;
const BoardInput = styled.input<BoardInputProps>`
  background-color: ${(props) =>
    props.isError
      ? "var(--vscode-inputValidation-errorBackground)"
      : "var(--vscode-input-background)"};
  color: ${(props) =>
    props.isError
      ? "var(--vscode-inputValidation-errorForeground)"
      : "var(--vscode-input-foreground)"};
  font-size: 0.8em;
  border: ${(props) =>
    props.isError ? "var(--vscode-inputValidation-errorBorder)" : "none"};
  text-align: center;
  &:focus {
    outline: none;
  }
`;
const BoardName = styled.h1`
  text-align: center;
  .edit-icon {
    vertical-align: middle;
    margin-left: 8px;
    visibility: hidden;
    cursor: pointer;
  }
  &:hover {
    .edit-icon {
      visibility: visible;
    }
  }
  .input-error {
    padding: 0 30px 0 50px;
    transition: 0.28s;
    /* font-style: italic; */
    font-size: 16px;
  }
`;

export default function Board({
  configJson,
  vscodeApi,
  allDirectoryNames,
}: any) {
  // Initialize board state with board data
  const [boardData, setBoardData] = useState(defaultBoardConfig);
  const [isEdit, setEdit] = useState(false);
  const [boardName, setBoardName] = useState("");
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
    updateState(data);
  }

  function updateState(data: types.Board) {
    // Save state of the current webview;
    vscodeApi.setState(data);
    setBoardData(data);
  }

  function onDragEnd(result: any) {
    if (!result.destination) {
      return;
    }

    if (result.type === "column") {
      // if the list is scrolled it looks like there is some strangeness going on
      // with react-window. It looks to be scrolling back to scroll: 0
      // I should log an issue with the project
      const columnsOrder = reorderList(
        boardData.columnsOrder,
        result.source.index,
        result.destination.index
      );
      updateJsonConfig({
        ...boardData,
        columnsOrder,
      });
      return;
    }

    // reordering in same list
    if (result.source.droppableId === result.destination.droppableId) {
      const column = boardData.columns[result.source.droppableId];
      const tasksIds = reorderList(
        column.tasksIds,
        result.source.index,
        result.destination.index
      );

      // updating column entry
      const newState: types.Board = {
        ...boardData,
        columns: {
          ...boardData.columns,
          [column.id]: {
            ...column,
            tasksIds,
          },
        },
      };
      updateJsonConfig(newState);
      return;
    }

    // moving between lists
    const sourceColumn = boardData.columns[result.source.droppableId];
    const destinationColumn = boardData.columns[result.destination.droppableId];
    const item = sourceColumn.tasksIds[result.source.index];

    // 1. remove item from source column
    const newSourceColumn: types.Column = {
      ...sourceColumn,
      tasksIds: [...sourceColumn.tasksIds],
    };
    newSourceColumn.tasksIds.splice(result.source.index, 1);

    // 2. insert into destination column
    const newDestinationColumn: types.Column = {
      ...destinationColumn,
      tasksIds: [...destinationColumn.tasksIds],
    };
    // in line modification of items
    newDestinationColumn.tasksIds.splice(result.destination.index, 0, item);

    const newState: types.Board = {
      ...boardData,
      columns: {
        ...boardData.columns,
        [newSourceColumn.id]: newSourceColumn,
        [newDestinationColumn.id]: newDestinationColumn,
      },
    };

    updateJsonConfig(newState);
  }
  const [isNameError, setNameError] = useState(false);
  useEffect(() => {
    const filteredDir: string[] = allDirectoryNames.filter(
      (x: string) => x !== boardData.boardName
    );
    if (filteredDir.indexOf(boardName) !== -1) {
      setNameError(true);
    } else {
      setNameError(false);
    }
  }, [boardName, allDirectoryNames]);

  function updateBoardName(boardName: string) {
    setEdit(false);
    if (boardName && !isNameError) {
      let newState = { ...boardData, boardName: boardName };
      vscodeApi.postMessage({
        action: ACTION.renameBoard,
        from: boardData.boardName,
        to: boardName,
        data: newState,
      });
      updateState(newState);
    } else {
      setBoardName(boardData.boardName);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    callback: Function
  ) {
    if (event.key === "Enter") {
      callback();
    }
  }

  function onBoardEdit() {
    setEdit(true);
    setBoardName(boardData.boardName);
  }
  return (
    <div>
      <BoardName className="board-name">
        {isEdit ? (
          <>
            <BoardInput
              isError={isNameError}
              type="text"
              autoFocus
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onKeyDown={(e) =>
                handleKeyDown(e, () => updateBoardName(boardName))
              }
              onBlur={() => {
                updateBoardName(boardName);
              }}
            />{" "}
            {isNameError && (
              <div className="input-error">
                Board by name "{boardName}" already exists.
              </div>
            )}
          </>
        ) : (
          <span>
            {boardData.boardName}
            <span
              className="edit-icon"
              title="Edit Board Name"
              onClick={onBoardEdit}
            >
              <AiOutlineEdit />
            </span>
          </span>
        )}
      </BoardName>
      <BoardEl>
        {/* Create context for drag & drop */}
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Get all columns in the order specified in 'board-initial-data.ts' */}
          {boardData.columnsOrder.map((columnId: any, index: number) => {
            // Get id of the current column
            const column: types.Column = (boardData.columns as any)[columnId];
            // Get item belonging to the current column
            const tasks = column.tasksIds.map(
              (taskId: string) => (boardData.tasks as any)[taskId]
            );
            // Render the BoardColumn component
            return (
              <BoardColumn
                key={column.id}
                column={column}
                tasks={tasks}
                index={index}
              />
            );
          })}
        </DragDropContext>
      </BoardEl>
    </div>
  );
}
