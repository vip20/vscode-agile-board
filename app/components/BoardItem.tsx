import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import styled from '@emotion/styled';
import * as t from '../../src/core/types';
import { areEqual } from 'react-window';
import InputBox from './InputBox';
import { BsExclamationDiamond, BsDiamondHalf } from 'react-icons/bs';
import { VscChevronRight, VscKebabVertical } from 'react-icons/vsc';
import { CgArrowBottomLeftR } from 'react-icons/cg';
import { BiTrash } from 'react-icons/bi';
import { GiRoundKnob } from 'react-icons/gi';
import { RiTimerFlashFill } from 'react-icons/ri';
import { MdCheck, MdClear } from 'react-icons/md';
import { useEffect, useRef } from 'react';
import { useContext } from 'react';
import { PriorityColorsContext } from '../context/priorityColors';
import { ContextMenu } from './ContextMenu';
import ReactDatetimeClass from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import './BoardItem.scss';
import { useState } from 'react';
import useResponsive from '../hooks/useResponsive';
import useOutsideClick from '../hooks/useOutsideClick';
const moment = require('moment');
// Define types for board item element properties
type BoardItemProps = {
  index: number;
  style: any;
  data: {
    tasks: t.Task[];
    editTask: Function;
    openTaskFile: Function;
    deleteTask: Function;
    outerRef: any;
  };
};

// Define types for board item element style properties
// This is necessary for TypeScript to accept the 'isDragging' prop.
type BoardItemStylesProps = {
  isDragging: boolean;
  priority: number;
  priorityColors: string[];
};

export const TaskCard = styled.div`
  margin: 4px 4px 4px 0px;
  height: calc(100% - 4px);
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const TaskTitle = styled.h4`
  flex: 0 0 80%;
  margin: 0px;
`;

export const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  place-content: space-between;
  padding: 8px;
`;
// Create style for board item element
export const BoardItemEl = styled.div<BoardItemStylesProps>`
  background-color: ${props =>
    props.isDragging
      ? 'var(--vscode-editorGroup-dropBackground)'
      : 'var(--vscode-tab-inactiveBackground)'};
  border-radius: 4px;
  transition: background-color 0.25s ease-out;
  border: 1px solid transparent;
  border-left: 4px solid transparent;
  border-left-color: ${props =>
    props.priority ? props.priorityColors[props.priority] : 'transparent'};
  &:hover {
    background-color: var(--vscode-editorGroupHeader-tabsBackground);
    border-color: var(--vscode-tab-inactiveBackground);
    border-left-color: ${props =>
      props.priority
        ? props.priorityColors[props.priority]
        : 'var(--vscode-tab-inactiveBackground)'};
  }
  :focus {
    outline: none;
  }

  /* & + & {
    margin-top: 4px;
  } */
`;

export const TaskCardFooter = styled.div`
  padding: 5px;
  display: flex;
  flex-direction: row;
`;

// Create and export the BoardItem component
export const BoardItem = React.memo(({ data, index, style }: BoardItemProps) => {
  const task: t.Task = data.tasks[index];
  if (!task) {
    return null;
  }

  return (
    <Draggable draggableId={task.id} key={task.id} index={index}>
      {(provided, snapshot) => (
        <Task
          provided={provided}
          isDragging={snapshot.isDragging}
          task={task}
          style={style}
          data={data}
        />
      )}
    </Draggable>
  );
}, areEqual);

export function Task({ provided, task, style, isDragging, data }: any) {
  function editTaskByKey(value: string, type: string) {
    const clonedTask = { ...task };
    clonedTask[type] = value;
    clonedTask.modifiedDate = moment().toISOString();
    data.editTask(task.id, clonedTask);
  }
  const [dueDateText, setDueDateText] = useState('');
  const [yPos, setYPos] = useState(0);
  const [xPos, setXPos] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const dtPickerRef = useRef<any>(moment().endOf('day').toISOString());
  const menuRef = useRef<any>();
  const { height } = useResponsive();
  const [priorityColors] = useContext(PriorityColorsContext);
  var yesterday = moment().subtract(1, 'day');
  useEffect(() => {
    setDueDateText(moment(task.dueDate).fromNow());
  }, [task.dueDate]);
  useOutsideClick(menuRef, () => {
    setShowMenu(false);
  });

  var valid = (current: any) => {
    return current.isAfter(yesterday);
  };
  const dropdownMenu: t.DropdownMenu = {
    primary: {
      main: [
        {
          children: 'Change Priority',
          goToMenu: 'changePriority',
          leftIcon: <GiRoundKnob />,
          rightIcon: <VscChevronRight />,
        },
        {
          children: 'Delete This Task',
          leftIcon: <BiTrash />,
          callbackFn: () => data.deleteTask(task.id),
        },
        {
          children: 'Set Deadline',
          goToMenu: 'setDeadline',
          leftIcon: <RiTimerFlashFill />,
          rightIcon: <VscChevronRight />,
        },
      ],
    },
    secondary: {
      changePriority: [
        {
          children: 'High',
          leftIcon: <BsExclamationDiamond />,
          callbackFn: () => {
            setShowMenu(false);
            data.editTask(task.id, { ...task, priority: 2 });
          },
        },
        {
          children: 'Medium',
          leftIcon: <BsDiamondHalf />,
          callbackFn: () => {
            setShowMenu(false);
            data.editTask(task.id, { ...task, priority: 1 });
          },
        },
        {
          children: 'Low',
          leftIcon: <CgArrowBottomLeftR style={{ transform: 'rotate(315deg)' }} />,
          callbackFn: () => {
            setShowMenu(false);
            data.editTask(task.id, { ...task, priority: 0 });
          },
        },
        // {
        //   children: "None",
        //   leftIcon: <BsDiamond />,
        // },
      ],
      setDeadline: [
        {
          transparentOnHover: true,
          children: (
            <>
              <ReactDatetimeClass
                input={false}
                open={true}
                isValidDate={valid}
                initialValue={moment(dtPickerRef.current)}
                onChange={(val: any) => {
                  dtPickerRef.current = val.toISOString();
                }}
              />
            </>
          ),
        },
        {
          children: `Apply Deadline`,
          leftIcon: <MdCheck />,
          isDisabled: false,
          callbackFn: () => {
            setShowMenu(false);
            data.editTask(task.id, { ...task, dueDate: dtPickerRef.current });
          },
        },
        {
          children: 'Clear Deadline',
          isDisabled: false,
          leftIcon: <MdClear />,
          callbackFn: () => {
            setShowMenu(false);
            data.editTask(task.id, { ...task, dueDate: null });
          },
        },
      ],
    },
    config: {
      isBottom: height - yPos < 440,
    },
  };

  return (
    <BoardItemEl
      className="task-card-parent"
      id={task.id}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
      isDragging={isDragging}
      priority={task.priority}
      priorityColors={priorityColors}
      style={getStyle({
        draggableStyle: provided.draggableProps.style,
        virtualStyle: { ...style, cursor: 'pointer' },
        isDragging,
      })}
    >
      <TaskCard onClick={() => data.openTaskFile(task.files[0])}>
        <TitleRow>
          <TaskTitle>
            <InputBox
              title="Edit Task Title"
              value={task.title}
              onChange={(e: string) => {}}
              applyChange={(e: string) => editTaskByKey(e, 'title')}
              textAlign="left"
            ></InputBox>
          </TaskTitle>

          <span ref={menuRef}>
            <span
              onClick={e => {
                e.stopPropagation();
                setYPos(e.pageY);
                setXPos(e.pageX);
                setShowMenu(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              <VscKebabVertical></VscKebabVertical>
            </span>
            {showMenu && (
              <ContextMenu
                {...{
                  dropdownMenu,
                  xPos: `${xPos}px`,
                  yPos: `${yPos}px`,
                }}
                ref={menuRef}
              />
            )}
          </span>
        </TitleRow>
        <TaskCardFooter>
          {task.dueDate && (
            <div
              title={`Due: ${moment(task.dueDate).format('lll')}`}
              style={{
                fontSize: '0.8em',
              }}
            >
              <RiTimerFlashFill
                style={{
                  color: dueDateText.indexOf('ago') !== -1 ? priorityColors[2] : priorityColors[1],
                }}
              />
              &thinsp;{`Due ${dueDateText}`}
            </div>
          )}
        </TaskCardFooter>
      </TaskCard>
      {/* {showMenu && itemId === task.id && (
        <div>
          <ContextMenu
            {...{
              dropdownMenu,
              xPos: `${xPos}px`,
              yPos: `${yPos}px`,
            }}
            ref={menuRef}
          />
        </div>
      )} */}
    </BoardItemEl>
  );
}

function getStyle({ draggableStyle, virtualStyle, isDragging }: any) {
  const combined = {
    ...virtualStyle,
    ...draggableStyle,
  };

  const grid = 8;
  // when dragging we want to use the draggable style for placement, otherwise use the virtual style
  const result = {
    ...combined,
    height: isDragging ? combined.height : combined.height - grid,
    left: isDragging ? combined.left : combined.left + grid,
    width: isDragging ? draggableStyle.width : `calc(${combined.width} - ${grid * 2}px)`,
    marginBottom: grid,
  };

  return result;
}
