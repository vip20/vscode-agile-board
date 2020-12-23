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
import { VscKebabVertical, VscChevronRight, VscAdd } from "react-icons/vsc";
import DropdownMenu from "../drop-down";
import useOutsideClick from "../../hooks/useOutsideClick";
import {
  BiArrowToLeft,
  BiArrowToRight,
  BiAddToQueue,
  BiTrash,
} from "react-icons/bi";
import { COLUMN_ADD } from "../../core/constants";
import { AST_PropAccess } from "terser";
import { findDOMNode } from "react-dom";

const AddTask = styled.div`
  text-align: center;
  width: 96%;
  margin: 0 2%;
  height: 15px;
  font-size: 16px;
  vertical-align: middle;
  position: relative;
  bottom: 0px;
  padding: 10px 0;
  background-color: var(--vscode-tab-inactiveBackground);
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid transparent;
  &:hover {
    background-color: var(--vscode-editorGroupHeader-tabsBackground);
    border-color: var(--vscode-tab-inactiveBackground);
  }
`;
const ColumnTitle = styled.h2`
  text-align: left;
  height: 37px;
  margin: 0;
  max-width: 80%;
  flex: 0 0 80%;
  /* padding: 2%; */
  border: 1px solid transparent;
  border-radius: 4px;
  font: 20px sans-serif;
  font-weight: 600;
  cursor: default;
`;
// Define types for board column element properties
export type BoardColumnProps = {
  key: string;
  column: types.Column;
  tasks: types.Task[];
  columnIndex: number;
  columnNames: string[];
  editColumn: Function;
  addColumn: Function;
  deleteColumn: Function;
  editTask: Function;
  addTask: Function;
  openTaskFile: Function;
  deleteTask: Function;
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
  max-width: 300px;
  overflow-x: hidden;
  overflow-y: auto;

  & + & {
    margin-left: 12px;
  }

  .task-list {
    scroll-behavior: smooth;
  }
`;

// Create styles for BoardColumnTitle element
const BoardColumnTitle = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  display: flex;
  place-content: space-between;
  align-items: baseline;
  padding: 10px;
`;

function getBackgroundColor(isDraggingOver: boolean) {
  return isDraggingOver
    ? "var(--vscode-editorGroup-dropBackground)"
    : "transparent";
}

// Create and export the BoardColumn component
export const BoardColumn: React.FC<BoardColumnProps> = React.memo(
  (props: BoardColumnProps) => {
    const [nameErrMsg, setNameErrMsg] = useState("");
    const [columnName, setColumnName] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    const menuRef = useRef<any>();

    useOutsideClick(menuRef, () => {
      setMenuOpen(false);
    });
    useEffect(() => {
      const filteredDir: string[] = props.columnNames.filter(
        (x: string) => x !== props.column.title
      );
      if (filteredDir.indexOf(columnName) !== -1) {
        setNameErrMsg(`Column by name "${columnName}" already exists.`);
      } else {
        setNameErrMsg("");
      }
    }, [columnName, props.columnNames]);
    return (
      <Draggable
        draggableId={props.column.id}
        key={props.column.id}
        index={props.columnIndex}
      >
        {(provided) => {
          const dropdownMenu: types.DropdownMenu = {
            primary: {
              main: [
                {
                  children: "Add Column",
                  goToMenu: "addColumn",
                  rightIcon: <VscChevronRight />,
                  leftIcon: <BiAddToQueue />,
                },
                {
                  children: "Delete Column",
                  callbackFn: () => {
                    setMenuOpen(false);
                    props.deleteColumn(props.column.id, props.columnIndex);
                  },
                  isDisabled:
                    props.column.isDefault || props.column.tasksIds.length > 0,
                  leftIcon: <BiTrash />,
                },
              ],
            },
            secondary: {
              addColumn: [
                {
                  children: "Before This",
                  callbackFn: () => {
                    setMenuOpen(false);
                    props.addColumn(COLUMN_ADD.before, props.columnIndex);
                  },
                  leftIcon: <BiArrowToLeft />,
                },
                {
                  children: "After This",
                  callbackFn: () => {
                    setMenuOpen(false);
                    props.addColumn(COLUMN_ADD.after, props.columnIndex);
                  },
                  leftIcon: <BiArrowToRight />,
                },
              ],
            },
          };
          return (
            <BoardColumnWrapper
              {...provided.draggableProps}
              ref={provided.innerRef}
            >
              <BoardColumnTitle {...provided.dragHandleProps}>
                <ColumnTitle>
                  <InputBox
                    title="Edit Column Name"
                    value={props.column.title}
                    errMsg={nameErrMsg}
                    onChange={(e: string) => setColumnName(e)}
                    applyChange={(e: string) => props.editColumn(e)}
                    textAlign="left"
                  ></InputBox>
                </ColumnTitle>
                <div ref={menuRef}>
                  <span
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{ cursor: "pointer" }}
                  >
                    <VscKebabVertical></VscKebabVertical>
                  </span>
                  {menuOpen && (
                    <div>
                      <DropdownMenu {...dropdownMenu} />
                    </div>
                  )}
                </div>
              </BoardColumnTitle>

              <TaskList {...props} />
            </BoardColumnWrapper>
          );
        }}
      </Draggable>
    );
  }
);

const TaskList = React.memo((props: BoardColumnProps) => {
  const { height } = useResponsive();
  const listRef = useRef<any>();
  const [isAdd, setAdd] = useState(false);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTo(0);
    }
  }, [props.columnIndex]);
  useEffect(() => {
    if (isAdd) {
      listRef.current.scrollToItem(props.column.tasksIds.length - 1);
      setAdd(false);
    }
  }, [props.column.tasksIds.length]);
  function addTaskAndScroll(columnId: string) {
    props.addTask(columnId);
    setAdd(true);
  }
  let taskData = {
    tasks: props.tasks,
    editTask: (id: string, task: types.Task) => props.editTask(id, task),
    openTaskFile: (fileName: string) => props.openTaskFile(fileName),
    deleteTask: (id: string) => props.deleteTask(id, props.column.id),
  };
  return (
    <>
      <Droppable
        droppableId={props.column.id}
        mode="virtual"
        renderClone={(provided, snapshot, rubric) => (
          <Task
            provided={provided}
            isDragging={snapshot.isDragging}
            task={props.tasks[rubric.source.index]}
          />
        )}
      >
        {(provided, snapshot) => {
          const itemCount = snapshot.isUsingPlaceholder
            ? props.tasks.length + 1
            : props.tasks.length;
          return (
            <FixedSizeList
              className="task-list"
              height={height - 200}
              itemCount={itemCount}
              itemSize={110}
              width={300}
              outerRef={provided.innerRef}
              itemData={taskData}
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

      <AddTask onClick={() => addTaskAndScroll(props.column.id)}>
        <VscAdd />
      </AddTask>
    </>
  );
});
