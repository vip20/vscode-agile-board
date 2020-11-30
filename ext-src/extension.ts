import * as vscode from "vscode";
import setupBoard from "../src/lib/setupBoard";
import newBoard from "../src/lib/newBoard";
import ReactPanel from "../src/lib/reactPanel";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("vsagile.startDummy", () => {
      ReactPanel.createOrShow(context.extensionPath);
    })
  );

  // Start Board
  let newBoardDisposable = vscode.commands.registerCommand(
    "vsagile.start",
    newBoard
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
