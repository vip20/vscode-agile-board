import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
import { getDirectories, getDirectoriesWithTime, resolveHome } from "./utils";
import { contextType } from "react-datetime";

export class VSAgileTreeView {
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItem | undefined | null | void
  > = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;
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
      let allDirectories = getDirectoriesWithTime(this.boardFolder);
      let boardItems = [
        new TreeItem(
          "Boards",
          "rootBoard",
          allDirectories.map((board) => {
            let command: vscode.Command = {
              title: `Open ${board.name}`,
              command: "vsagile.open",
              arguments: [board.name],
            };
            return new TreeItem(
              board.name,
              "board",
              undefined,
              command,
              ` ${formatDate(board.time)}`
            );
          })
        ),
      ];
      return boardItems;
    }
    return element.children;
  }
}

var formatDate = function (timestamp: any) {
  // Create a date object from the timestamp
  let date = new Date(timestamp);

  // Create a list of names for the months
  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // return a formatted date
  return (
    months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear()
  );
};

class TreeItem extends vscode.TreeItem {
  children: TreeItem[] | undefined;
  command: vscode.Command | undefined;
  contextValue: string;
  description?: string;
  constructor(
    label: string,
    contextValue: string,
    children?: TreeItem[],
    command?: vscode.Command,
    description?: string
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
    this.description = description;
  }
}
