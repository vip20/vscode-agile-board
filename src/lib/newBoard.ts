import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import {
  resolveHome,
  createFileUtils,
  getDirectories,
  showQuickPick,
} from "./utils";
import { ACTION, defaultBoardConfig } from "../../src/core/constants";
import { Board } from "../../src/core/types";
import ReactPanel from "./reactPanel";
const moment = require("moment");
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
  const quickPickItems: vscode.QuickPickItem[] = getDirectories(
    boardFolder
  ).map((x) => ({
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
  createBoard(boardFolder, extensionPath, inputPromise);
}

function createBoard(
  boardFolder: string,
  extensionPath: string,
  inputPromise: Promise<vscode.QuickPickItem>
) {
  inputPromise.then(
    (value) => {
      if (value === null || !value || value.label === "") {
        return false;
      }
      // Replace empty space with underscore
      let boardName = value.label.replace(/\s/g, "_");
      let dir = path.join(boardFolder, boardName);

      let boardConfigFile = path.join(dir, "config.json");

      fs.ensureDirSync(dir);
      fs.ensureFileSync(boardConfigFile);
      let config: Board = fs.readJSONSync(boardConfigFile, { throws: false });
      if (!config) {
        config = {
          ...defaultBoardConfig,
          boardName: value.label,
          createdDate: moment().toISOString(),
        };
        fs.writeJsonSync(boardConfigFile, config);
      }
      ReactPanel.createOrShow(extensionPath);
      ReactPanel.getPanel()?.webview.postMessage({
        action: ACTION.fetchJson,
        data: config,
      });
    },
    (e) => {
      if (e === "isEmpty") {
        vscode.window.showErrorMessage("Don't leave board name blank");
      }
    }
  );
}
