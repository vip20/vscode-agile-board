import * as path from "path";
import { ACTION, BLANK_SPACE_ALTERNATIVE } from "../core/constants";
import ReactPanel from "./reactPanel";
import { getDirectories, updateConfigJson, updateDirName } from "./utils";
import { window, Disposable, WebviewPanel } from "vscode";

// Handle messages from the webview
export default function handleMessages(
  panel: WebviewPanel,
  boardFolder: string,
  _disposables: Disposable[]
) {
  panel.webview.onDidReceiveMessage(
    (message) => {
      switch (message.action) {
        case ACTION.alert:
          window.showErrorMessage(message.data);
          return;
        case ACTION.updateJson:
          let dirPath = path.join(
            boardFolder,
            message.board.replace(/\s/g, BLANK_SPACE_ALTERNATIVE)
          );
          updateConfigJson(dirPath, message.data);
          return;
        case ACTION.renameBoard:
          let toValue = message.to.replace(/\s/g, BLANK_SPACE_ALTERNATIVE);
          let fromValue = message.from.replace(/\s/g, BLANK_SPACE_ALTERNATIVE);
          let fromDir = path.join(boardFolder, fromValue);
          let toDir = path.join(boardFolder, toValue);
          ReactPanel.panel.title = `VSAgile: ${message.to}`;
          updateDirName(fromDir, toDir);
          updateConfigJson(toDir, message.data);
          ReactPanel.panel.webview.postMessage({
            action: ACTION.allDirectories,
            data: getDirectories(boardFolder),
          });
          return;
      }
    },
    null,
    _disposables
  );
}
