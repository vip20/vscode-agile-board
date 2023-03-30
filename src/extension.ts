import * as vscode from 'vscode';
import { ViewLoader } from './view/ViewLoader';
import setupBoard from './view/lib/setupBoard';
import newBoard, { addBoard, createBoard } from './view/lib/newBoard';
import { getBoardFolder } from './view/lib/utils';
import { VSAgileTreeView } from './view/lib/treeView';

export function activate(context: vscode.ExtensionContext) {
  const boardFolder = getBoardFolder();
  const treeView = new VSAgileTreeView(boardFolder);
  vscode.window.registerTreeDataProvider('vsagile', treeView);

  // Refresh View
  let refreshViewDisposable = vscode.commands.registerCommand('vsagile.refreshTree', () =>
    treeView.refresh()
  );
  context.subscriptions.push(refreshViewDisposable);

  // openBoard
  let openBoardDisposable = vscode.commands.registerCommand('vsagile.open', board => {
    const boardFolder = getBoardFolder();
    const panel = ViewLoader.showWebview(context);
    createBoard(boardFolder, context.extensionPath, board, panel);
  });
  context.subscriptions.push(openBoardDisposable);

  // Add Board
  let addBoardDisposable = vscode.commands.registerCommand('vsagile.add', () => {
    const boardFolder = getBoardFolder();
    const panel = ViewLoader.showWebview(context);
    addBoard(boardFolder, context.extensionPath, panel);
  });
  context.subscriptions.push(addBoardDisposable);

  // Start Board
  let newBoardDisposable = vscode.commands.registerCommand('vsagile.start', () => {
    const boardFolder = getBoardFolder();
    const panel = ViewLoader.showWebview(context);
    newBoard(boardFolder, context.extensionPath, panel);
  });
  context.subscriptions.push(newBoardDisposable);

  // Run setup
  let setupDisposable = vscode.commands.registerCommand('vsagile.setupBoard', setupBoard);
  context.subscriptions.push(setupDisposable);
}
// this method is called when your extension is deactivated
export function deactivate() {}
