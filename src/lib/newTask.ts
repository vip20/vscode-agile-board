import * as vscode from "vscode";
import * as fs from "fs-extra";
import * as path from "path";
import moment from "moment";
import { resolveHome } from "./utils";

// This function handles creation of a new task in default board folder
export function newTask(boardName: string) {
  const config = vscode.workspace.getConfiguration("vsagile");
  const boardFolder = resolveHome(config.get("defaultBoardPath") || "");

  if (boardFolder == null || !boardFolder) {
    vscode.window.showErrorMessage(
      "Default board folder not found. Please run setup."
    );
    return;
  }
  createTask(boardFolder, boardName);
}

async function createTask(boardFolder: string, boardName: string) {
  let fileName = `${moment().format("YYYY-MM-DD_HH-mm-ss")}.md`;
  const createFilePromise = createFile(
    path.join(boardFolder, boardName),
    fileName
  );
  createFilePromise.then((filePath) => {
    if (typeof filePath !== "string") {
      console.error("Invalid file path");
      return false;
    }

    vscode.window
      .showTextDocument(vscode.Uri.file(filePath), {
        preserveFocus: false,
        preview: true,
      })
      .then(() => {
        console.log("Task created successfully: ", filePath);
      });
  });
}

// Create the given file if it doesn't exist
function createFile(folderPath: string, fileName: string) {
  return new Promise((resolve, reject) => {
    if (folderPath == null || fileName == null) {
      reject();
    }
    const fullPath = path.join(folderPath, fileName);
    // fs-extra
    fs.ensureFile(fullPath)
      .then(() => {
        resolve(fullPath);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
