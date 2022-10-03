import { HookInfo, ListenerInfo, MethodInfo, PropInfo } from "../controller/Metadata.types.ts";

export type Callable<T = string> = CallableMethod<T> | CallableHook<T>;

interface BaseCallable<T = string> {
  type: "method" | "hook";
  // deno-lint-ignore ban-types
  handle: Function;
  path: T;
  props: Array<PropInfo>;
  listeners: { before: Array<ListenerInfo>; after: Array<ListenerInfo> };
}

export interface CallableMethod<T = string> extends BaseCallable<T> {
  type: "method";
  action: MethodInfo<T>["action"];
}

export interface CallableHook<T = string> extends BaseCallable<T> {
  type: "hook";
  level: HookInfo<T>["level"];
}

export interface MatchedResult<T extends Callable<unknown>> {
  callable: T;
  params: Record<string, unknown>;
}
