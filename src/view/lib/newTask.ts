import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';
import { NEW_MD_FILE_TEXT } from '../../core/constants';
// This function handles creation of a new task in default board folder

export async function createTask(boardFolder: string, boardName: string, taskId: string) {
  let filePath = newFileName(path.join(boardFolder, boardName), taskId, 'md');
  if (filePath) {
    let fullPath = path.join(boardFolder, boardName, filePath);
    fs.createFileSync(fullPath);
    fs.writeFileSync(fullPath, NEW_MD_FILE_TEXT);
    openFileSide(fullPath);
  }
  return filePath;
}

export function openFileSide(fullPath: string) {
  vscode.window
    .showTextDocument(vscode.Uri.file(fullPath), {
      preserveFocus: false,
      preview: false,
      viewColumn: vscode.ViewColumn.Beside,
    })
    .then(() => {
      console.log('Task created successfully: ', fullPath);
    });
}

function newFileName(pathName: string, fileName: string, ext: string) {
  let counter = 1;
  let newName = `${fileName}_${counter}.${ext}`;
  let newPath = path.join(pathName, newName);
  while (fs.existsSync(newPath)) {
    newName = `${fileName}_${counter}.${ext}`;
    newPath = path.join(pathName, newName);
    counter++;
  }
  return newName;
}

export function deleteFile(fullPath: string) {
  fs.removeSync(fullPath);
}
