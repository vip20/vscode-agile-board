import * as React from "react";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import styled from "@emotion/styled";
import { BoardColumn } from "../board-column";
import { ACTION, defaultBoardConfig } from "../../core/constants";
import * as t from "../../core/types";
import { AiOutlineEdit } from "react-icons/ai";
import { reorderList } from "../../core/helpers";

type BoardInputProps = {
  isError: boolean;
};
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
  const [state, setState] = useState(defaultBoardConfig);
  const [isEdit, setEdit] = useState(false);
  const [boardName, setBoardName] = useState("");
  useEffect(() => {
    // Update board when configJson changes from input
    setState(configJson);
    if (configJson !== defaultBoardConfig) {
      vscodeApi.setState(configJson);
    }
  }, [configJson]);

  useEffect(() => {
    let oldState = vscodeApi.getState();
    // when there is a state available use that to display webview works when tab changes
    if (oldState && oldState !== state) {
      setState(oldState);
    }
  }, [vscodeApi]);

  function updateJsonConfig(data: t.Board, isInit: boolean = false) {
    vscodeApi.postMessage({
      action: ACTION.updateJson,
      board: data.boardName,
      data: data,
    });
    updateState(data);
  }

  function updateState(data: t.Board) {
    // Save state of the current webview;
    vscodeApi.setState(data);
    setState(data);
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
        state.columnsOrder,
        result.source.index,
        result.destination.index
      );
      updateJsonConfig({
        ...state,
        columnsOrder,
      });
      return;
    }

    // reordering in same list
    if (result.source.droppableId === result.destination.droppableId) {
      const column: t.Column = state.columns[result.source.droppableId];
      const tasksIds = reorderList(
        column.tasksIds,
        result.source.index,
        result.destination.index
      );

      // updating column entry
      const newState = {
        ...state,
        columns: {
          ...state.columns,
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
    const sourceColumn = state.columns[result.source.droppableId];
    const destinationColumn = state.columns[result.destination.droppableId];
    const tasksIds = sourceColumn.tasksIds[result.source.index];

    // 1. remove item from source column
    const newSourceColumn = {
      ...sourceColumn,
      tasksIds: [...sourceColumn.tasksIds],
    };
    newSourceColumn.tasksIds.splice(result.source.index, 1);

    // 2. insert into destination column
    const newDestinationColumn = {
      ...destinationColumn,
      tasksIds: [...destinationColumn.tasksIds],
    };
    // in line modification of items
    newDestinationColumn.tasksIds.splice(result.destination.index, 0, tasksIds);

    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [newSourceColumn.id]: newSourceColumn,
        [newDestinationColumn.id]: newDestinationColumn,
      },
    };

    updateJsonConfig(newState);
  }
  const [isNameError, setNameError] = useState(false);
  useEffect(() => {
    const filteredDir: string[] = allDirectoryNames.filter(
      (x: string) => x !== state.boardName
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
      let newState = { ...state, boardName: boardName };
      vscodeApi.postMessage({
        action: ACTION.renameBoard,
        from: state.boardName,
        to: boardName,
        data: newState,
      });
      updateState(newState);
    } else {
      setBoardName(state.boardName);
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
    setBoardName(state.boardName);
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
              {state.boardName}
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
        <Droppable
          droppableId="all-droppables"
          direction="horizontal"
          type="column"
        >
          {(provided) => (
            <div
              className="board-columns"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {state.columnsOrder.map((columnId: any, index: number) => {
                // Get id of the current column
                const column: t.Column = (state.columns as any)[columnId];
                // Get item belonging to the current column
                const tasks = column.tasksIds.map(
                  (taskId: string) => (state.tasks as any)[taskId]
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
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}
