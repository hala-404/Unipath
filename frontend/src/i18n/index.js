import en from "./en";
import ar from "./ar";
import zh from "./zh";

export const translations = { en, ar, zh };

/**
 * Resolve a dot-path key like "nav.home" from a translations object.
 * Returns the key itself as fallback if not found.
 */
export function resolve(obj, path) {
  return path.split(".").reduce((acc, part) => acc?.[part], obj) ?? path;
}
