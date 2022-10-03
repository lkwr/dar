// deno-lint-ignore-file ban-types no-explicit-any
import {
  BodyPropInfo,
  HookInfo,
  IMetadata,
  ListenerInfo,
  ListenerType,
  MethodInfo,
  PropType,
  RouteType,
} from "../controller/Metadata.types.ts";
import { IncomingMessage, OutgoingMessage } from "../transport/Transport.ts";
import { Logger } from "../Application.ts";
import { Callable } from "../routing/Routing.types.ts";
import { BaseRouter } from "./BaseRouter.ts";

export class RouteGenerator<T = string> {
  constructor(
    private metadata: IMetadata<T>,
    private router: BaseRouter<T>,
    private log: Logger,
    private basePath?: T,
    private parentPath?: T,
  ) {
  }

  async generate() {
    for (const route of this.metadata.routes ?? []) {
      const listeners = (this.metadata.listeners ?? []).filter(
        (listener) => listener.route === route.property,
      );

      switch (route.type) {
        case RouteType.METHOD:
          await this.generateMethod(route, listeners);
          break;
        case RouteType.HOOK:
          await this.generateHook(route, listeners);
          break;
      }
    }

    // TODO -> enable include. Currently its disabled
    // for (const include of metadata.includes ?? []) {
    //   if (include.skipControllerPath) {
    //     include.metadata.controller.path = include.path;
    //   } else {
    //     // TODO no default string... because not every "path" can be stringified
    //     include.metadata.controller.path = router.merge(
    //       include.path ?? "",
    //       include.metadata.controller.path ?? "",
    //     );
    //   }

    //   const includedPath = mergeURLPattern(
    //     include.absolute ? "" : parentPath,
    //     include.absolute ? "" : controller.path ?? "",
    //   );
    //   log(
    //     "Register included...      " +
    //       getStringOfRoute(
    //         mergeURLPattern(
    //           basePath,
    //           include.metadata.controller.absolute ? "" : includedPath,
    //           include.metadata.controller.path || "",
    //         ),
    //       ),
    //     "info",
    //   );
    //   const { routes: includedRoutes, hooks: includedHooks } = generateRoutes(
    //     include.metadata,
    //     includedPath,
    //     basePath,
    //     log,
    //   );

    //   routes.push(...includedRoutes);
    //   hooks.push(...includedHooks);
    // }

    return Promise.resolve();
  }

  private async generateMethod(method: MethodInfo<T>, listeners: ListenerInfo[]) {
    // const path = mergeURLPattern(
    //   basePath,
    //   route.absolute || controller.absolute ? "" : parentPath || "",
    //   route.absolute ? "" : controller.path || "",
    //   route.path || "",
    // );

    const path = this.router.merge(
      this.basePath,
      method.absolute || this.metadata.controller.absolute ? undefined : this.parentPath,
      method.absolute ? undefined : this.metadata.controller.path,
      method.path,
    );

    this.log(
      "Register route... " + method.action.padEnd(7, " ") + " " + this.router.stringifyPath(path),
      "info",
    );
    if (method.handle) {
      await this.router.put({
        type: "method",
        handle: method.handle,
        action: method.action,
        path,
        props: this.metadata.props?.[method.property] ?? [],
        listeners: {
          before: listeners.filter((listen) => listen.type === ListenerType.BEFORE),
          after: listeners.filter((listen) => listen.type === ListenerType.AFTER),
        },
      });
    }
  }

  private async generateHook(hook: HookInfo<T>, listeners: ListenerInfo[]) {
    // const path = mergeURLPattern(
    //             basePath,
    //             route.absolute ? "" : parentPath,
    //             route.absolute ? "" : controller.path || "",
    //             route.path || "",
    //           );
    const path = hook.path as T;

    this.log(
      "Register hook...  " +
        ("[" + hook.level + "] ").padEnd(8, " ") +
        this.router.stringifyPath(path),
      "info",
    );

    if (hook.handle) {
      await this.router.put({
        type: "hook",
        handle: hook.handle,
        props: this.metadata.props?.[hook.property] || [],
        path,
        level: hook.level,
        listeners: {
          before: listeners.filter((listen) => listen.type === ListenerType.BEFORE),
          after: listeners.filter((listen) => listen.type === ListenerType.AFTER),
        },
      });
    }
  }
}

export const callRoute = async <C extends Record<never, never>>(
  min: IncomingMessage<C>,
  mout: OutgoingMessage<C>,
  route: Callable<unknown>,
  params: Record<string, unknown>,
): Promise<OutgoingMessage> => {
  const Handle = route.handle;

  const props = await generateArguments(min, mout, route, params);

  // before listener
  for (const listener of route.listeners.before) {
    try {
      listener.handle(min, mout);
    } catch (err) {
      if (err instanceof OutgoingMessage) {
        return err;
      }
      console.error(err);
    }
  }

  // TODO instance (this) handling? -> currently undefined
  const result = (Handle as Function).call(undefined, ...props);

  // after listener
  for (const listener of route.listeners.after) {
    try {
      listener.handle(min, mout);
    } catch (err) {
      if (err instanceof OutgoingMessage) {
        return err;
      }
      console.error(err);
    }
  }

  if (result !== undefined) {
    if (result instanceof Promise) {
      return mout.write(await result);
    } else {
      return mout.write(result);
    }
  } else {
    return mout;
  }
};

const generateArguments = async <C extends Record<never, never>>(
  request: IncomingMessage<C>,
  response: OutgoingMessage,
  route: Callable<unknown>,
  params: Record<string, unknown>,
): Promise<any[]> => {
  const args: any[] = [];
  const url = new URL(request.url);

  for (const prop of route.props || []) {
    switch (prop.type) {
      case PropType.BODY: {
        switch ((prop as BodyPropInfo).bodyType) {
          case "json":
            args[prop.index] = await request.json();
            break;
          case "text":
            args[prop.index] = await request.text();
            break;
          case "arrayBuffer":
            args[prop.index] = await request.arrayBuffer();
            break;
          case "blob":
            args[prop.index] = await request.blob();
            break;
          case "formData":
            args[prop.index] = await request.formData();
            break;
          case "stream":
            args[prop.index] = request.body;
            break;
        }
        break;
      }
      case PropType.CONTEXT: {
        if (prop.key) {
          args[prop.index] = (request.context as any)[prop.key];
        } else {
          args[prop.index] = request.context;
        }
        break;
      }
      case PropType.PARAM: {
        args[prop.index] = params[prop.key!];
        break;
      }
      case PropType.SEARCH: {
        args[prop.index] = url.searchParams.get(prop.key!);
        break;
      }
      case PropType.HEADER: {
        args[prop.index] = request.headers.get(prop.key!);
        break;
      }
      case PropType.INCOMING_MESSAGE: {
        args[prop.index] = request;
        break;
      }
      case PropType.OUTGOING_MESSAGE: {
        args[prop.index] = response;
        break;
      }
      default: {
        args[prop.index] = undefined;
      }
    }
  }

  return args;
};
