import { BaseRouter } from "../routing/BaseRouter.ts";
import { Callable, CallableHook, CallableMethod, MatchedResult } from "../routing/Routing.types.ts";
import { normalizePath, normalizeURL } from "../utils/Routing.utils.ts";
import { IncomingMessage } from "../transport/Transport.ts";

export class SimpleRouter extends BaseRouter<string> {
  private methods: Array<CallableMethod> = [];
  private preHooks: Array<CallableHook> = [];
  private postHooks: Array<CallableHook> = [];

  put(callable: Callable<string>): boolean {
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
  ): MatchedResult<CallableMethod<string>> | null {
    const url = new URL(request.url);

    for (const method of this.methods) {
      if (normalizePath(url.pathname) !== normalizePath(method.path)) continue;
      return {
        callable: method,
        params: {},
      };
    }

    return null;
  }

  findHook(
    request: IncomingMessage,
    type: "pre" | "post",
  ): Array<MatchedResult<CallableHook<string>>> {
    const results: MatchedResult<CallableHook<string>>[] = [];
    const url = new URL(request.url);

    for (const hook of (type === "pre" ? this.preHooks : this.postHooks)) {
      if (normalizeURL(url.pathname) !== (hook.path === "*" ? normalizeURL(url.pathname) : normalizeURL(hook.path))) {
        continue;
      }
      results.push({
        callable: hook,
        params: {},
      });
    }

    return results;
  }

  merge(...path: Array<string | undefined>): string {
    let result = "";

    for (const cur of path) {
      if (!cur) continue;
      result += "/" + cur;
    }

    return normalizePath(result);
  }

  stringifyPath(path: string): string {
    return path;
  }

  getStats(): { methods: number; preHooks: number; postHooks: number } {
    return { methods: this.methods.length, preHooks: this.preHooks.length, postHooks: this.postHooks.length };
  }
}
