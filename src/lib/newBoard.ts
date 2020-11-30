import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { resolveHome, createFileUtils } from "./utils";
import { defaultBoardConfig } from "../core/constants";
import { Board } from "../core/types";
const moment = require("moment");
export default function newBoard() {
  const config = vscode.workspace.getConfiguration("vsagile");
  const boardFolder = resolveHome(config.get("defaultBoardPath") || "");

  if (boardFolder == null || !boardFolder) {
    vscode.window.showErrorMessage(
      "Default board folder not found. Please run setup."
    );
    return;
  }
  createBoard(boardFolder);
}

function createBoard(boardFolder: string) {
  const inputPromise = vscode.window.showInputBox({
    prompt: `Board title?. Do not leave this blank.`,
    value: "",
  });
  inputPromise.then((value) => {
    if (value === null || value === "" || !value) {
      return false;
    }
    // Replace empty space with underscore
    let boardName = value.replace(/\s/g, "_");
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
  });
}
