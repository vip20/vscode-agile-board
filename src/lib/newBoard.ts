import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { resolveHome } from "./utils";
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
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    //TODO create a config file here within board
  });
}
