import * as t from "./types";

export const defaultBoardConfig: t.Board = {
  boardName: "",
  createdDate: "",
  tasks: {},
  columns: {
    backlog: {
      id: "backlog",
      title: "Backlog",
      tasksIds: [],
      isDefault: true,
    },
    doing: {
      id: "doing",
      title: "In Progress",
      tasksIds: [],
      isDefault: true,
    },
    done: {
      id: "done",
      title: "Done",
      tasksIds: [],
      isDefault: true,
    },
    closed: {
      id: "closed",
      title: "Closed",
      tasksIds: [],
      isDefault: true,
    },
  },
  columnsOrder: ["backlog", "doing", "done", "closed"],
};

export const defaultBoardConfig2: t.Board = {
  boardName: "Lorem Ipsum",
  createdDate: "2020-11-30T17:56:43.589Z",
  tasks: {
    "item-1": { id: "item-1", description: "Content of item 1." },
    "item-2": { id: "item-2", description: "Content of item 2." },
    "item-3": { id: "item-3", description: "Content of item 3." },
    "item-4": { id: "item-4", description: "Content of item 4." },
    "item-5": { id: "item-5", description: "Content of item 5." },
    "item-6": { id: "item-6", description: "Content of item 6." },
    "item-7": { id: "item-7", description: "Content of item 7." },
  },
  columns: {
    backlog: {
      isDefault: true,
      id: "backlog",
      title: "Backlog",
      tasksIds: ["item-2", "item-5", "item-4", "item-1", "item-7"],
    },
    doing: {
      isDefault: true,
      id: "doing",
      title: "In Progress",
      tasksIds: ["item-3", "item-6"],
    },
    done: {
      isDefault: true,
      id: "done",
      title: "Done",
      tasksIds: [],
    },
    closed: {
      isDefault: true,
      id: "closed",
      title: "Closed",
      tasksIds: [],
    },
  },
  columnsOrder: ["backlog", "doing", "done", "closed"],
};

export const ACTION = {
  alert: "alert",
  refactor: "refactor",
  updateJson: "updateJson",
  fetchJson: "fetchJson",
  renameBoard: "renameBoard",
  allDirectories: "allDirectories",
};

export const BLANK_SPACE_ALTERNATIVE = "_";
