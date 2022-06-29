import { sep } from "path";

function isWindowsPath(path: string): boolean {
  return /^[a-zA-Z]:\\/.test(path);
}

export default function isDescendant(
  parent: string,
  descendant: string
): boolean {
  if (parent === descendant) {
    return true;
  }

  if (parent.charAt(parent.length - 1) !== sep) {
    parent += sep;
  }

  // Windows is case insensitive
  if (isWindowsPath(parent)) {
    parent = parent.toLowerCase();
    descendant = descendant.toLowerCase();
  }

  return descendant.startsWith(parent);
}
