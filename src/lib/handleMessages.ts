import * as path from "path";
import { ACTION } from "../core/constants";
import ReactPanel from "./reactPanel";
import { updateConfigJson } from "./utils";
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
      }
    },
    null,
    _disposables
  );
}
