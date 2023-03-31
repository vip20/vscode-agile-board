import * as path from 'path';
import { BLANK_SPACE_ALTERNATIVE } from '../../core/constants';
import {
  getBoardFolder,
  getDirectories,
  updateConfigJson,
  updateDirName,
  reFetchSettings,
  reFetchConfig,
} from './utils';
import { window, Disposable, WebviewPanel } from 'vscode';
import { createTask, deleteFile, openFileSide } from './newTask';
import * as t from '../../core/types';
import { Message } from './messageTypes';

// Handle messages from the webview
export default function handleMessages(panel: WebviewPanel, _disposables: Disposable[]) {
  panel.webview.onDidReceiveMessage(
    (message: Message) => {
      const boardFolder = getBoardFolder();
      const payload = message.payload;
      switch (message.type) {
        case 'alert':
          window.showErrorMessage(payload.data);
          break;
        case 'updateJson':
          let dirPath = path.join(
            boardFolder,
            payload.board.replace(/\s/g, BLANK_SPACE_ALTERNATIVE)
          );
          updateConfigJson(dirPath, payload.data);
          break;
        case 'renameBoard':
          let toValue = payload.to.replace(/\s/g, BLANK_SPACE_ALTERNATIVE);
          let fromValue = payload.from.replace(/\s/g, BLANK_SPACE_ALTERNATIVE);
          let fromDir = path.join(boardFolder, fromValue);
          let toDir = path.join(boardFolder, toValue);
          panel.title = `VSAgile: ${payload.to}`;
          updateDirName(fromDir, toDir);
          updateConfigJson(toDir, payload.data);
          panel.webview.postMessage({
            type: 'allDirectories',
            payload: {
              data: getDirectories(boardFolder),
            },
          });
          break;
        case 'addTaskFile':
          let data: t.Board = payload.data;
          let taskId = payload.taskId;
          let boardName = payload.boardName.replace(/\s/g, BLANK_SPACE_ALTERNATIVE);
          createTask(boardFolder, boardName, taskId).then((fileName: string) => {
            if (data.tasks[taskId].files) {
              data.tasks[taskId].files.push(fileName);
            } else {
              data.tasks[taskId].files = [fileName];
            }
            let boardPath = path.join(boardFolder, boardName);
            updateConfigJson(boardPath, data);
            panel.webview.postMessage({
              type: 'fetchJson',
              payload: {
                data: data,
              },
            });
          });
          break;
        case 'openTaskFile':
          let fullPath = path.join(
            boardFolder,
            payload.boardName.replace(/\s/g, BLANK_SPACE_ALTERNATIVE),
            payload.fileName
          );
          openFileSide(fullPath);
          break;
        case 'deleteFiles':
          let fileNames: string[] = payload.fileNames;
          fileNames.forEach(fileName => {
            let fullPath = path.join(
              boardFolder,
              payload.boardName.replace(/\s/g, BLANK_SPACE_ALTERNATIVE),
              fileName
            );
            deleteFile(fullPath);
          });
          break;
        case 'reFetchSettings':
          reFetchSettings(panel);
          break;
        case 'reFetchConfig':
          reFetchConfig(payload.boardName.replace(/\s/g, BLANK_SPACE_ALTERNATIVE), panel);
          break;
      }
    },
    null,
    _disposables
  );
}
