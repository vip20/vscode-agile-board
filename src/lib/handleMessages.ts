import * as path from "path";
import { ACTION, BLANK_SPACE_ALTERNATIVE } from "../core/constants";
import ReactPanel from "./reactPanel";
import { updateConfigJson, updateDirName } from "./utils";
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
          updateConfigJson(path.join(boardFolder, message.board), message.data);
          return;
        case ACTION.renameBoard:
          let toValue = message.to.replace(/\s/g, BLANK_SPACE_ALTERNATIVE);
          let fromValue = message.from.replace(/\s/g, BLANK_SPACE_ALTERNATIVE);
          let fromDir = path.join(boardFolder, fromValue);
          let toDir = path.join(boardFolder, toValue);
          ReactPanel.panel.title = `VSAgile: ${message.to}`;
          updateDirName(fromDir, toDir);
          updateConfigJson(toDir, message.data);
          return;
      }
    },
    null,
    _disposables
  );
}
