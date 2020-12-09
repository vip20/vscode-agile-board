import { Board } from "./types";

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

export const ACTION = {
  alert: "alert",
  refactor: "refactor",
  updateJson: "updateJson",
  fetchJson: "fetchJson",
  renameBoard: "renameBoard",
  allDirectories: "allDirectories",
};

export const BLANK_SPACE_ALTERNATIVE = "_";
