import * as path from "path";
import * as os from "os";
import * as fs from "fs-extra";
import * as types from "../core/types";

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
