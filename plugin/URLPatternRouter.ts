import { BaseRouter } from "../routing/BaseRouter.ts";
import { Callable, CallableHook, CallableMethod, MatchedResult } from "../routing/Routing.types.ts";
import { normalizePath, normalizeURL } from "../utils/Routing.utils.ts";
import { IncomingMessage } from "../transport/Transport.ts";

export class URLPatternRouter extends BaseRouter<URLPatternInput> {
  private methods: Array<CallableMethod<URLPatternInput>> = [];
  private preHooks: Array<CallableHook<URLPatternInput>> = [];
  private postHooks: Array<CallableHook<URLPatternInput>> = [];

  put(callable: Callable<URLPatternInput>): boolean {
    switch (callable.type) {
      case "method":
        this.methods.push(callable);
        return true;
      case "hook":
        if (callable.level >= 0) {
          this.postHooks.push(callable);
        } else {
          this.preHooks.push(callable);
        }
        return true;
      default:
        return false;
    }
  }

  findMethod(
    request: IncomingMessage,
  ): MatchedResult<CallableMethod<URLPatternInput>> | null {
    const url = normalizeURL(request.url);

    for (const method of this.methods) {
      if (method.action !== request.method) continue;
      const match = new URLPattern(method.path).exec(url);
      if (!match) return null;
      return {
        callable: method,
        params: {
          ...match.hash.groups,
          ...match.hostname.groups,
          ...match.password.groups,
          ...match.pathname.groups,
          ...match.port.groups,
          ...match.protocol.groups,
          ...match.search.groups,
          ...match.username.groups,
        },
      };
    }

    return null;
  }

  findHook(
    request: IncomingMessage,
    type: "pre" | "post",
  ): Array<MatchedResult<CallableHook<URLPatternInput>>> {
    const results: MatchedResult<CallableHook<URLPatternInput>>[] = [];
    const url = new URL(request.url);

    for (const hook of (type === "pre" ? this.preHooks : this.postHooks)) {
      const match = new URLPattern(hook.path).exec(url);
      if (!match) continue;
      results.push({
        callable: hook,
        params: {
          ...match.hash.groups,
          ...match.hostname.groups,
          ...match.password.groups,
          ...match.pathname.groups,
          ...match.port.groups,
          ...match.protocol.groups,
          ...match.search.groups,
          ...match.username.groups,
        },
      });
    }

    return results;
  }

  merge(...path: Array<URLPatternInput | undefined>): URLPatternInput {
    const nonUndefined = path.filter((path) => !!path) as Array<URLPatternInput>;
    const result: URLPatternInit = { pathname: "/" };

    for (const item of nonUndefined) {
      if (typeof item === "string") {
        result.pathname += "/" + item;
      } else {
        result.pathname += "/" + item.pathname;
      }
    }

    result.pathname = normalizePath(result.pathname ?? "/");
    return result;
  }

  stringifyPath(path: URLPatternInput): string {
    if (typeof path === "string") {
      return path;
    } else {
      return JSON.stringify(path);
    }
  }

  getStats(): { methods: number; preHooks: number; postHooks: number } {
    return { methods: this.methods.length, preHooks: this.preHooks.length, postHooks: this.postHooks.length };
  }
}
