import * as path from "path";
import * as os from "os";
import * as fs from "fs-extra";
import * as types from "../core/types";
import {
  window,
  QuickPickItem,
  Disposable,
  QuickInput,
  workspace,
} from "vscode";
import { QuickPickParameters } from "../core/types";
import { ACTION, BLANK_SPACE_ALTERNATIVE } from "../core/constants";
import ReactPanel from "./reactPanel";

// Resolves the home tilde.
export function resolveHome(filepath: string) {
  if (path == null || !filepath) {
    return "";
  }

  if (filepath[0] === "~") {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
}

// Create the given file if it doesn't exist
export function createFileUtils(folderPath: string, fileName: string) {
  return new Promise((resolve, reject) => {
    if (folderPath == null || fileName == null) {
      reject();
    }
    const fullPath = path.join(folderPath, fileName);
    // fs-extra
    fs.ensureFile(fullPath)
      .then(() => {
        resolve(fullPath);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getBoardFolder() {
  const config = workspace.getConfiguration("vsagile");
  const boardFolder = resolveHome(config.get("defaultBoardPath") || "");
  return boardFolder;
}
export function getPriorityColorScheme() {
  const config = workspace.getConfiguration("vsagile");
  const priorityColorScheme = resolveHome(
    config.get("priorityColorScheme") || ""
  );
  return priorityColorScheme;
}

export function reFetchSettings() {
  ReactPanel.panel.webview.postMessage({
    action: ACTION.priorityColors,
    data: getPriorityColorScheme(),
  });
}

export function updateConfigJson(boardPath: string, data: types.Board) {
  fs.writeFileSync(path.join(boardPath, "config.json"), JSON.stringify(data));
}

export function getDirectories(source: string) {
  return getDirectoriesWithTime(source).map((x) => x.name);
}
export function getDirectoriesWithTime(source: string) {
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => ({
      name: dirent.name,
      time: fs.statSync(path.join(source, dirent.name)).ctime.getTime(),
    }))
    .sort((a, b) => {
      return b.time - a.time;
    })
    .map((x) => ({
      name: x.name.replace(BLANK_SPACE_ALTERNATIVE, " "),
      time: x.time,
    }));
}
let current: QuickInput;

export async function showQuickPick<
  T extends QuickPickItem,
  P extends QuickPickParameters<T>
>({ title, items, placeholder, activeItem }: P) {
  const disposables: Disposable[] = [];

  try {
    return await new Promise<
      T | (P extends { buttons: (infer I)[] } ? I : never)
    >((resolve, reject) => {
      const input = window.createQuickPick<T>();
      input.title = title;
      input.placeholder = placeholder;
      if (activeItem) {
        input.activeItems = [activeItem];
      }
      input.items = items;

      disposables.push(
        input.onDidChangeSelection((items) => {
          if (items[0].alwaysShow) {
            if (input.value) {
              let defaultItem: T = { label: input.value } as T;
              resolve(defaultItem);
            } else {
              input.dispose();
              reject("isEmpty");
            }
          } else {
            resolve(items[0]);
          }
        })
      );
      if (current) {
        current.dispose();
      }
      current = input;
      current.show();
    });
  } finally {
    disposables.forEach((d) => d.dispose());
  }
}

export function updateDirName(fromDir: string, toDir: string) {
  fs.renameSync(fromDir, toDir);
}

export const reFetchConfig = (boardName: string) => {
  const boardFolder = getBoardFolder();
  let dir = path.join(boardFolder, boardName);
  let boardConfigFile = path.join(dir, "config.json");

  fs.ensureDirSync(dir);
  fs.ensureFileSync(boardConfigFile);
  let config: types.Board = fs.readJSONSync(boardConfigFile, { throws: false });

  ReactPanel.panel.webview.postMessage({
    action: ACTION.fetchJson,
    data: config,
  });
};
