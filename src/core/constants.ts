import { Board } from "./types";

// export const initialBoardData = {
//   items: {
//     "item-1": { id: "item-1", content: "Content of item 1." },
//     "item-2": { id: "item-2", content: "Content of item 2." },
//     "item-3": { id: "item-3", content: "Content of item 3." },
//     "item-4": { id: "item-4", content: "Content of item 4." },
//     "item-5": { id: "item-5", content: "Content of item 5." },
//     "item-6": { id: "item-6", content: "Content of item 6." },
//     "item-7": { id: "item-7", content: "Content of item 7." },
//   },
//   columns: {
//     "column-1": {
//       id: "column-1",
//       title: "Column 1",
//       itemsIds: [
//         "item-1",
//         "item-2",
//         "item-3",
//         "item-4",
//         "item-5",
//         "item-6",
//         "item-7",
//       ],
//     },
//     "column-2": {
//       id: "column-2",
//       title: "Column 2",
//       itemsIds: [],
//     },
//     "column-3": {
//       id: "column-3",
//       title: "Column 3",
//       itemsIds: [],
//     },
//     "column-4": {
//       id: "column-4",
//       title: "Column 4",
//       itemsIds: [],
//     },
//   },
//   columnsOrder: ["column-1", "column-2", "column-3", "column-4"],
// };

export const defaultBoardConfig: Board = {
  boardName: "",
  createdDate: "",
  tasks: {},
  columns: {
    backlog: {
      id: "backlog",
      title: "Backlog",
      tasksIds: [],
    },
    doing: {
      id: "doing",
      title: "Doing",
      tasksIds: [],
    },
    done: {
      id: "done",
      title: "Done",
      tasksIds: [],
    },
    closed: {
      id: "closed",
      title: "Closed",
      tasksIds: [],
    },
  },
  columnsOrder: ["backlog", "doing", "done", "closed"],
};
