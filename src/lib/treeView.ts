import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getDirectories, resolveHome } from "./utils";
import { contextType } from "react-datetime";

export class VSAgileTreeView {
  _onDidChangeTreeData = new vscode.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  refresh() {
    this._onDidChangeTreeData.fire();
  }

  constructor(public boardFolder: string) {}

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    element?: TreeItem | undefined
  ): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {
      let allDirectories = getDirectories(this.boardFolder);
      let boardItems = [
        new TreeItem(
          "Boards",
          "rootBoard",
          allDirectories.map((board) => {
            let command: vscode.Command = {
              title: `Open ${board}`,
              command: "vsagile.open",
              arguments: [board],
            };
            return new TreeItem(board, "board", undefined, command);
          })
        ),
      ];
      return boardItems;
    }
    return element.children;
  }
}

class TreeItem extends vscode.TreeItem {
  children: TreeItem[] | undefined;
  command: vscode.Command | undefined;
  contextValue: string;
  constructor(
    label: string,
    contextValue: string,
    children?: TreeItem[],
    command?: vscode.Command
  ) {
    super(
      label,
      children === undefined
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Expanded
    );
    this.children = children;
    this.command = command;
    this.contextValue = contextValue;
  }
}
