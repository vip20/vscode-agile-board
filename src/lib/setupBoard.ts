import * as vscode from "vscode";
import * as path from "path";
export default function () {
  const msg =
    "Welcome to VSAgile. To begin, choose a location to save your Agile Boards. Click Start to continue ->";

  const startOption = vscode.window.showInformationMessage(msg, ...["Start"]);
  startOption.then((value) => {
    if (value === "Start") {
      // Open a folder picker for user to choose note folder
      const uriPromise = vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select",
      });

      uriPromise.then(
        (res: any) => {
          if (res.length > 0 && res[0].fsPath) {
            const noteFolder = vscode.workspace.getConfiguration("vsagile");
            const update = noteFolder.update(
              "defaultBoardPath",
              path.normalize(res[0].fsPath),
              true
            );
            update.then(() => {
              vscode.window.showInformationMessage(
                "Board Path Saved. Edit the location by re-running setup or editing the path in VS Code Settings."
              );
            });
          }
        },
        (err) => {
          vscode.window.showErrorMessage("Error occurred during setup.");
          console.error(err);
        }
      );
    }
  });
}
