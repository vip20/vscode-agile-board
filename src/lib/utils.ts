import * as path from "path";
import * as os from "os";

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
