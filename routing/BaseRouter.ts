import { BaseContext, EmptyContext, IncomingMessage } from "../transport/Transport.ts";
import { OptionalPromise } from "../utils/Type.utils.ts";
import { Callable, CallableHook, CallableMethod, MatchedResult } from "./Routing.types.ts";

export abstract class BaseRouter<T = unknown> {
  abstract put(callable: Callable<T>): OptionalPromise<boolean>;

  abstract findMethod<C extends BaseContext = EmptyContext>(
    request: IncomingMessage<C>,
  ): OptionalPromise<MatchedResult<CallableMethod<T>> | null>;

  abstract findHook<C extends BaseContext = EmptyContext>(
    request: IncomingMessage<C>,
    type: "pre" | "post",
  ): OptionalPromise<Array<MatchedResult<CallableHook<T>>>>;

  abstract merge(...path: Array<T | undefined>): T;

  abstract stringifyPath(path: T): string;

  abstract getStats(): { methods: number; preHooks: number; postHooks: number };
}
