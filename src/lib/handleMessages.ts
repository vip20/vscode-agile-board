import * as path from "path";
import { ACTION } from "../core/constants";
import ReactPanel from "./reactPanel";
import { updateConfigJson } from "./utils";
import { window, Disposable } from "vscode";

// Handle messages from the webview
export default function handleMessages(
  boardFolder: string,
  _disposables: Disposable[]
) {
  ReactPanel.getPanel()?.webview.onDidReceiveMessage(
    (message) => {
      switch (message.action) {
        case ACTION.alert:
          window.showErrorMessage(message.data);
          return;
        case ACTION.updateJson:
          updateConfigJson(path.join(boardFolder, message.board), message.data);
          return;
      }
    },
    null,
    _disposables
  );
}
