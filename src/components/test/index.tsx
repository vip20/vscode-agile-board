// @flow
import React, { useState, useLayoutEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FixedSizeList, areEqual } from "react-window";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./style.css";
import { reorderList } from "../../core/helpers";
import * as t from "../../core/types";
import { defaultBoardConfig2 } from "../../core/constants";

function getStyle({ draggableStyle, virtualStyle, isDragging }: any) {
  // If you don't want any spacing between your items
  // then you could just return this.
  // I do a little bit of magic to have some nice visual space
  // between the row items
  const combined = {
    ...virtualStyle,
    ...draggableStyle,
  };

  // Being lazy: this is defined in our css file
  const grid = 8;

  // when dragging we want to use the draggable style for placement, otherwise use the virtual style
  const result = {
    ...combined,
    height: isDragging ? combined.height : combined.height - grid,
    left: isDragging ? combined.left : combined.left + grid,
    width: isDragging
      ? draggableStyle.width
      : `calc(${combined.width} - ${grid * 2}px)`,
    marginBottom: grid,
  };

  return result;
}

function Item({ provided, item, style, isDragging }: any) {
  return (
    <div
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
      style={getStyle({
        draggableStyle: provided.draggableProps.style,
        virtualStyle: style,
        isDragging,
      })}
      className={`item ${isDragging ? "is-dragging" : ""}`}
    >
      {item.description}
    </div>
  );
}

// Recommended react-window performance optimisation: memoize the row render function
// Things are still pretty fast without this, but I am a sucker for making things faster
const Row = React.memo(function Row(props: any) {
  const { data: items, index, style } = props;
  const item = items[index];

  // We are rendering an extra item for the placeholder
  if (!item) {
    return null;
  }

  return (
    <Draggable draggableId={item.id} index={index} key={item.id}>
      {(provided) => <Item provided={provided} item={item} style={style} />}
    </Draggable>
  );
}, areEqual);

const ItemList = React.memo(function ItemList({ column, index, tasks }: any) {
  // There is an issue I have noticed with react-window that when reordered
  // react-window sets the scroll back to 0 but does not update the UI
  // I should raise an issue for this.
  // As a work around I am resetting the scroll to 0
  // on any list that changes it's index
  const listRef = useRef<any>();
  useLayoutEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTo(0);
    }
  }, [index]);

  return (
    <Droppable
      droppableId={column.id}
      mode="virtual"
      renderClone={(provided, snapshot, rubric) => (
        <Item
          provided={provided}
          isDragging={snapshot.isDragging}
          item={tasks[rubric.source.index]}
        />
      )}
    >
      {(provided, snapshot) => {
        // Add an extra item to our list to make space for a dragging item
        // Usually the DroppableProvided.placeholder does this, but that won't
        // work in a virtual list
        const itemCount = snapshot.isUsingPlaceholder
          ? tasks.length + 1
          : tasks.length;

        return (
          <FixedSizeList
            height={500}
            itemCount={itemCount}
            itemSize={110}
            width={300}
            outerRef={provided.innerRef}
            itemData={tasks}
            className="task-list"
            ref={listRef}
          >
            {Row}
          </FixedSizeList>
        );
      }}
    </Droppable>
  );
});

const Column = React.memo(function Column({ column, index, tasks }: any) {
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          className="column"
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <h3 className="column-title" {...provided.dragHandleProps}>
            {column.title}
          </h3>
          <ItemList column={column} index={index} tasks={tasks} />
        </div>
      )}
    </Draggable>
  );
});

export function TestBoard() {
  const [state, setState] = useState<t.Board>(defaultBoardConfig2);

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
      setState({
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
      setState(newState);
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

    setState(newState);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="app">
        <Droppable
          droppableId="all-droppables"
          direction="horizontal"
          type="column"
        >
          {(provided) => (
            <div
              className="columns"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {state.columnsOrder.map((columnId, index) => {
                const column: t.Column = state.columns[columnId];
                // Get item belonging to the current column
                const tasks = column.tasksIds.map(
                  (taskId: string) => state.tasks[taskId]
                );
                return (
                  <Column
                    key={columnId}
                    column={column}
                    index={index}
                    tasks={tasks}
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
