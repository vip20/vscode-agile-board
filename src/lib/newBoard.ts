import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import {
  resolveHome,
  createFileUtils,
  getDirectories,
  showQuickPick,
} from "./utils";
import {
  ACTION,
  BLANK_SPACE_ALTERNATIVE,
  defaultBoardConfig,
} from "../../src/core/constants";
import { Board } from "../../src/core/types";
import ReactPanel from "./reactPanel";
const moment = require("moment");
let allDirectories: string[] = [];
export default function newBoard(boardFolder: string, extensionPath: string) {
  if (boardFolder == null || !boardFolder) {
    vscode.window.showErrorMessage(
      "Default board folder not found. Please run setup."
    );
    return;
  }
  quickPick(boardFolder, extensionPath);
}
function quickPick(boardFolder: string, extensionPath: string) {
  allDirectories = getDirectories(boardFolder);
  const quickPickItems: vscode.QuickPickItem[] = allDirectories.map((x) => ({
    label: x,
  }));
  quickPickItems.unshift({
    label: "＋ Create new board...",
    alwaysShow: true,
  });
  const inputPromise = showQuickPick({
    title: "Create or Select exiting Board",
    items: quickPickItems,
    placeholder: "Select a board to open",
  });
  inputPromise.then(
    (value) => {
      createBoard(boardFolder, extensionPath, value.label);
    },
    async (e) => {
      if (e === "isEmpty") {
        const text = await vscode.window.showInputBox({
          prompt: `Existing boards will be opened if same name is used.`,
          value: "",
          placeHolder: "Board Title",
        });
        createBoard(boardFolder, extensionPath, text);
      }
    }
  );
}

function createBoard(
  boardFolder: string,
  extensionPath: string,
  value: string | undefined
) {
  if (value === null || value === "" || !value) {
    return false;
  }
  // Replace empty space with underscore
  let boardName = value.replace(/\s/g, BLANK_SPACE_ALTERNATIVE);
  let dir = path.join(boardFolder, boardName);

  let boardConfigFile = path.join(dir, "config.json");

  fs.ensureDirSync(dir);
  fs.ensureFileSync(boardConfigFile);
  let config: Board = fs.readJSONSync(boardConfigFile, { throws: false });
  if (!config) {
    config = {
      ...defaultBoardConfig,
      boardName: value,
      createdDate: moment().toISOString(),
    };
    fs.writeJsonSync(boardConfigFile, config);
  }
  ReactPanel.createOrShow(extensionPath);
  ReactPanel.panel.title = `VSAgile: ${value}`;
  ReactPanel.panel.webview.postMessage({
    action: ACTION.fetchJson,
    data: config,
  });
  ReactPanel.panel.webview.postMessage({
    action: ACTION.allDirectories,
    data: allDirectories,
  });
}
