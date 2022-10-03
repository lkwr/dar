import { join } from "../deps/std.ts";

export const normalizePath = (...path: string[]): string => {
  const joined = join("/", ...path, "/");
  if (joined.length !== 1) {
    return joined.slice(0, -1);
  } else {
    return joined;
  }
};

export const normalizeURL = (urlString: string): string => {
  const url = new URL(urlString);

  url.pathname = normalizePath(url.pathname);

  return url.toString();
};
