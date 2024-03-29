import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import styled from '@emotion/styled';
import { COLUMN_ADD, defaultBoardConfig } from '../../src/core/constants';
import { reorderList, uidGenerator } from '../../src/core/helpers';
import * as t from '../../src/core/types';
import { BoardColumn, BoardColumnProps } from './BoardColumn';
import InputBox from './InputBox';

const BoardName = styled.h1`
  text-align: center;
  height: 40px;
`;

export const Board = ({ configJson, allDirectoryNames }: any) => {
  const [state, setState] = useState(defaultBoardConfig);
  const [boardName, setBoardName] = useState('');
  useEffect(() => {
    // Update board when configJson changes from input
    setState(configJson);
    if (configJson !== defaultBoardConfig) {
      vscode.setState(configJson);
      setBoardName(configJson.boardName);
    }
  }, [configJson]);

  useEffect(() => {
    let oldState = vscode.getState();
    // when there is a state available use that to display webview works when tab changes
    if (oldState && oldState !== state) {
      vscode.postMessage({
        type: 'reFetchSettings',
      });
      vscode.postMessage({
        type: 'reFetchConfig',
        payload: {
          boardName: oldState.boardName,
        },
      });
    }
  }, [state]);

  function updateJsonConfig(data: t.Board, isInit: boolean = false) {
    vscode.postMessage({
      type: 'updateJson',
      payload: {
        board: data.boardName,
        data: data,
      },
    });
    updateState(data);
  }

  function updateState(data: t.Board) {
    // Save state of the current webview;
    vscode.setState(data);
    setState(data);
  }

  function onDragEnd(result: any) {
    if (!result.destination) {
      return;
    }

    if (result.type === 'column') {
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
      const tasksIds = reorderList(column.tasksIds, result.source.index, result.destination.index);

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
  const [nameErrMsg, setNameErrMsg] = useState('');
  useEffect(() => {
    const filteredDir: string[] = allDirectoryNames.filter((x: string) => x !== state.boardName);
    if (filteredDir.indexOf(boardName) !== -1) {
      setNameErrMsg(`Board by name "${boardName}" already exists.`);
    } else {
      setNameErrMsg('');
    }
  }, [allDirectoryNames, boardName, state.boardName]);

  function updateBoardName(boardName: string) {
    if (!nameErrMsg) {
      let newState = { ...state, boardName: boardName };
      vscode.postMessage({
        type: 'renameBoard',
        payload: {
          from: state.boardName,
          to: boardName,
          data: newState,
        },
      });
      updateJsonConfig(newState);
    }
  }

  function updateColumnName(columnName: string, columnId: string) {
    const newState = { ...state };
    newState.columns[columnId].title = columnName;
    newState.columns[columnId].modifiedDate = moment().toISOString();
    updateJsonConfig(newState);
  }

  function updateTask(taskId: string, task: t.Task) {
    const newState = { ...state };
    newState.tasks[taskId] = task;
    updateJsonConfig(newState);
  }

  function addColumn(type: COLUMN_ADD, index: number) {
    const newState = { ...state };
    const uid = `_${uidGenerator()}`;
    const atIndex = type === COLUMN_ADD.after ? index + 1 : index;
    const newColumn: t.Column = {
      id: uid,
      isDefault: false,
      tasksIds: [],
      title: `Col${uid}`,
      createdDate: moment().toISOString(),
    };
    newState.columns[newColumn.id] = newColumn;
    newState.columnsOrder.splice(atIndex, 0, newColumn.id);
    updateJsonConfig(newState);
  }
  function deleteColumn(columnId: string, index: number) {
    const newState = { ...state };
    delete newState.columns[columnId];
    newState.columnsOrder.splice(index, 1);
    updateJsonConfig(newState);
  }
  function addTask(columnId: string) {
    const newState = { ...state };
    const uid = `_${uidGenerator()}`;
    const newTask: t.Task = {
      id: uid,
      title: `Task${uid}`,
      description: `Edit Description`,
      createdDate: moment().toISOString(),
      files: [],
    };
    newState.tasks[newTask.id] = newTask;
    newState.columns[columnId].tasksIds.push(newTask.id);
    vscode.postMessage({
      type: 'addTaskFile',
      payload: { boardName: boardName, taskId: uid, data: newState },
    });
    updateState(newState);
  }

  function openTaskFile(fileName: string) {
    vscode.postMessage({
      type: 'openTaskFile',
      payload: {
        boardName: boardName,
        fileName: fileName,
      },
    });
  }
  function deleteTask(id: string, columnId: string) {
    const newState = { ...state };
    let fileNames = newState.tasks[id].files;
    delete newState.tasks[id];
    newState.columns[columnId].tasksIds = newState.columns[columnId].tasksIds.filter(x => x !== id);
    vscode.postMessage({
      type: 'deleteFiles',
      payload: {
        boardName: boardName,
        fileNames: fileNames,
      },
    });
    updateJsonConfig(newState);
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div>
        <BoardName className="board-name">
          <InputBox
            title="Edit Board Name"
            value={boardName}
            errMsg={nameErrMsg}
            onChange={(e: string) => setBoardName(e)}
            applyChange={(e: string) => updateBoardName(e)}
          ></InputBox>
        </BoardName>
        <Droppable droppableId="all-droppables" direction="horizontal" type="column">
          {provided => (
            <div className="board-columns" {...provided.droppableProps} ref={provided.innerRef}>
              {state.columnsOrder.map((columnId: any, index: number) => {
                // Get id of the current column
                const column: t.Column = (state.columns as any)[columnId];
                // Get item belonging to the current column
                const tasks = column.tasksIds.map((taskId: string) => (state.tasks as any)[taskId]);
                const allColumnTitles = Object.values(state.columns as any).map(
                  (x: any) => x.title
                );
                const data: BoardColumnProps = {
                  column: column,
                  columnNames: allColumnTitles,
                  key: column.id,
                  columnIndex: index,
                  editColumn: (e: string) => updateColumnName(e, column.id),
                  addColumn: (type: COLUMN_ADD, index: number) => addColumn(type, index),
                  deleteColumn: (id: string, index: number) => deleteColumn(id, index),
                  tasks: tasks,
                  editTask: (id: string, task: t.Task) => updateTask(id, task),
                  addTask: (columnId: string) => addTask(columnId),
                  openTaskFile: (fileName: string) => openTaskFile(fileName),
                  deleteTask: (id: string, columnId: string) => deleteTask(id, columnId),
                };
                // Render the BoardColumn component
                return <BoardColumn {...data} />;
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};
