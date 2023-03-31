import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';
import {
  resolveHome,
  createFileUtils,
  getDirectories,
  showQuickPick,
  getPriorityColorScheme,
  reFetchSettings,
  getBoardFolder,
} from './utils';
import { BLANK_SPACE_ALTERNATIVE, defaultBoardConfig } from '../../core/constants';
import { Board } from '../../core/types';
import { ViewLoader } from '../ViewLoader';
import { Message } from './messageTypes';
const moment = require('moment');

let allDirectories: string[] = [];

export default function newBoard(
  boardFolder: string,
  extensionPath: string,
  context: vscode.ExtensionContext
) {
  let boardExists = false;
  if (boardFolder) {
    boardExists = fs.existsSync(boardFolder);
  }
  if (!boardExists) {
    vscode.window.showErrorMessage('Default board folder not found. Please run setup.');
    return;
  }
  quickPick(boardFolder, extensionPath, context);
}
function quickPick(boardFolder: string, extensionPath: string, context: vscode.ExtensionContext) {
  allDirectories = getDirectories(boardFolder);
  const quickPickItems: vscode.QuickPickItem[] = allDirectories.map(x => ({
    label: x,
  }));
  quickPickItems.unshift({
    label: '＋ Create new board...',
    alwaysShow: true,
  });
  const inputPromise = showQuickPick({
    title: 'Create or Select exiting Board',
    items: quickPickItems,
    placeholder: 'Select a board to open',
  });
  inputPromise.then(
    value => {
      createBoard(boardFolder, extensionPath, value.label, context);
    },
    async e => {
      if (e === 'isEmpty') {
        addBoard(boardFolder, extensionPath, context);
      }
    }
  );
}

export async function addBoard(
  boardFolder: string,
  extensionPath: string,
  context: vscode.ExtensionContext
) {
  const text = await vscode.window.showInputBox({
    prompt: `Existing boards will be opened if same name is used.`,
    value: '',
    placeHolder: 'Board Title',
  });
  createBoard(boardFolder, extensionPath, text, context);
}

export function createBoard(
  boardFolder: string,
  extensionPath: string,
  value: string | undefined,
  context: vscode.ExtensionContext
) {
  if (value === null || value === '' || !value) {
    return false;
  }
  // Replace empty space with underscore
  let boardName = value.replace(/\s/g, BLANK_SPACE_ALTERNATIVE);
  let dir = path.join(boardFolder, boardName);

  let boardConfigFile = path.join(dir, 'config.json');

  fs.ensureDirSync(dir);
  fs.ensureFileSync(boardConfigFile);
  let config: Board = fs.readJSONSync(boardConfigFile, { throws: false });
  if (!config) {
    config = {
      ...defaultBoardConfig,
      boardName: value,
      createdDate: moment().toISOString(),
    };
    ['backlog', 'inProgress', 'done', 'closed'].forEach(x => {
      config.columns[x].createdDate = moment().toISOString();
    });
    fs.writeJsonSync(boardConfigFile, config);
  }
  const panel = ViewLoader.showWebview(context);
  panel.title = `VSAgile: ${value}`;
  panel.webview.onDidReceiveMessage((message: Message) => {
    if (message.type === 'boardInitialized') {
      panel.webview.postMessage({
        type: 'fetchJson',
        payload: {
          data: config,
        },
      });
      panel.webview.postMessage({
        type: 'allDirectories',
        payload: {
          data: allDirectories,
        },
      });
    }
  });
  reFetchSettings(panel);
}
