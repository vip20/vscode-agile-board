import * as path from "path";
import * as os from "os";
import * as fs from "fs-extra";
import * as types from "../core/types";
import { window, QuickPickItem, Disposable, QuickInput } from "vscode";
import { QuickPickParameters } from "../core/types";

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

export function updateConfigJson(boardPath: string, data: types.Board) {
  // console.log("update json", path.join(boardPath, "config.json"));
  fs.writeFileSync(path.join(boardPath, "config.json"), JSON.stringify(data));
}

export function getDirectories(source: string) {
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
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
