import * as vscode from "vscode";
import setupBoard from "../src/lib/setupBoard";
import newBoard, { addBoard, createBoard } from "../src/lib/newBoard";
import ReactPanel from "../src/lib/reactPanel";
import { getBoardFolder } from "../src/lib/utils";
import { VSAgileTreeView } from "../src/lib/treeView";

export function activate(context: vscode.ExtensionContext) {
  const boardFolder = getBoardFolder();
  const treeView = new VSAgileTreeView(boardFolder);
  vscode.window.registerTreeDataProvider("vsagile", treeView);

  // Refresh View
  let refreshViewDisposable = vscode.commands.registerCommand(
    "vsagile.refreshTree",
    () => treeView.refresh()
  );
  context.subscriptions.push(refreshViewDisposable);

  // openBoard
  let openBoardDisposable = vscode.commands.registerCommand(
    "vsagile.open",
    (board) => {
      const boardFolder = getBoardFolder();
      createBoard(boardFolder, context.extensionPath, board);
    }
  );
  context.subscriptions.push(openBoardDisposable);

  // Add Board
  let addBoardDisposable = vscode.commands.registerCommand(
    "vsagile.add",
    () => {
      const boardFolder = getBoardFolder();
      addBoard(boardFolder, context.extensionPath);
    }
  );
  context.subscriptions.push(addBoardDisposable);

  // Start Board
  let newBoardDisposable = vscode.commands.registerCommand(
    "vsagile.start",
    () => {
      const boardFolder = getBoardFolder();
      newBoard(boardFolder, context.extensionPath);
    }
  );
  context.subscriptions.push(newBoardDisposable);

  // Run setup
  let setupDisposable = vscode.commands.registerCommand(
    "vsagile.setupBoard",
    setupBoard
  );
  context.subscriptions.push(setupDisposable);
}
// this method is called when your extension is deactivated
export function deactivate() {}
