import * as React from "react";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import styled from "@emotion/styled";
import { BoardColumn } from "../board-column";
import { ACTION, defaultBoardConfig } from "../../core/constants";
import * as t from "../../core/types";
import { AiOutlineEdit } from "react-icons/ai";
import { reorderList } from "../../core/helpers";
import InputBox from "../input-box";

const BoardName = styled.h1`
  text-align: center;
  height: 40px;
`;

export default function Board({
  configJson,
  vscodeApi,
  allDirectoryNames,
}: any) {
  // Initialize board state with board data
  const [state, setState] = useState(defaultBoardConfig);
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
  const [nameErrMsg, setNameErrMsg] = useState("");
  useEffect(() => {
    const filteredDir: string[] = allDirectoryNames.filter(
      (x: string) => x !== state.boardName
    );
    if (filteredDir.indexOf(boardName) !== -1) {
      setNameErrMsg(`Board by name "${boardName}" already exists.`);
    } else {
      setNameErrMsg("");
    }
  }, [boardName, allDirectoryNames]);

  function updateBoardName(boardName: string) {
    if (!nameErrMsg) {
      let newState = { ...state, boardName: boardName };
      vscodeApi.postMessage({
        action: ACTION.renameBoard,
        from: state.boardName,
        to: boardName,
        data: newState,
      });
      updateJsonConfig(newState);
    }
  }

  function updateColumnName(columnName: string, columnId: string) {
    let newState = { ...state };
    newState.columns[columnId].title = columnName;
    updateJsonConfig(newState);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div>
        <BoardName className="board-name">
          <InputBox
            title="Enter Board Name"
            value={state.boardName}
            errMsg={nameErrMsg}
            onChange={(e: string) => setBoardName(e)}
            applyChange={(e: string) => updateBoardName(e)}
          ></InputBox>
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
                const allColumnTitles = Object.values(state.columns as any).map(
                  (x: any) => x.title
                );
                // Render the BoardColumn component
                return (
                  <BoardColumn
                    applyChange={(e: string) => updateColumnName(e, column.id)}
                    columnNames={allColumnTitles}
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
