import { BaseContext, EmptyContext, IncomingMessage, OutgoingMessage } from "./transport/Transport.ts";
import { Metadata } from "./controller/Metadata.ts";
import { BaseRouter } from "./routing/BaseRouter.ts";
import { SimpleRouter } from "./plugin/SimpleRouter.ts";
import { callRoute, RouteGenerator } from "./routing/Routing.ts";
import { IMetadata } from "./controller/Metadata.types.ts";
import { ControllerRegistry } from "./controller/ControllerRegistry.ts";
import { BodyConverter } from "./transport/Transport.types.ts";
import * as CommonBodies from "./plugin/CommonBodies.ts";

export class Application<T = string> {
  private log: Logger;
  private router: BaseRouter<T>;
  private bodyConverter: Array<BodyConverter>;

  constructor(private options: ApplicationOptions<T>) {
    // Logging
    if (typeof options.logger === "boolean" || !options.logger) {
      this.log = options.logger
        ? (msg, level = "info") => {
          const now = new Date();
          switch (level) {
            case "info":
              console.log(now, msg);
              break;
            case "debug":
              console.debug(now, msg);
              break;
            case "error":
              console.error(now, msg);
              break;
          }
        }
        : () => {};
    } else {
      this.log = options.logger;
    }

    // Plugin - Router
    this.router = options.router ?? new SimpleRouter() as any; // TODO
    this.log("Using Router: " + this.router.constructor.name);

    // Plugin - Body Converter
    this.bodyConverter = options.bodyConverter ?? [...Object.values(CommonBodies)];
    this.log(
      "Using Body Converters: " + (this.bodyConverter.map((func) => func.name).join(", ")),
    );

    this.loadController();
  }

  private loadController() {
    const controllers: Array<IMetadata<T>> = this.options.controller
      ? this.options.controller.map((controller) => Metadata.getMetadata(controller)).filter((controller) =>
        !!controller
      ) as Array<IMetadata<T>>
      : ControllerRegistry.get().getControllers<T>();

    for (const metadata of controllers) {
      this.log(
        "Register controller...    " +
          this.router.stringifyPath(
            this.router.merge(this.options.basePath, metadata.controller.path),
          ) +
          (metadata.controller.name ? ` (${metadata.controller.name})` : ""),
        "info",
      );
      new RouteGenerator<T>(
        metadata as IMetadata<T>,
        this.router,
        this.log,
        this.options.basePath,
      ).generate();
    }

    this.log(
      `Ready! Loaded ${this.router.getStats().methods} ${
        this.router.getStats().methods === 1 ? "route" : "routes"
      } and ${this.router.getStats().preHooks + this.router.getStats().postHooks} ${
        this.router.getStats().preHooks + this.router.getStats().postHooks === 1 ? "hook" : "hooks"
      }`,
      "info",
    );
  }

  async handle<C extends BaseContext = EmptyContext>(
    request: Request,
    context?: C,
  ): Promise<Response> {
    let mout: OutgoingMessage<C> = new OutgoingMessage(this.bodyConverter, context);
    const min: IncomingMessage<C> = IncomingMessage.fromRequest(request, context);

    const method = await this.router.findMethod(min);
    const preHooks = await this.router.findHook(min, "pre");
    const postHooks = await this.router.findHook(min, "post");

    // pre hooks
    for (const hook of preHooks) {
      await callRoute(min, mout, hook.callable, hook.params);
    }

    // main method
    if (method) {
      mout = await callRoute(min, mout, method.callable, method.params);
    } else {
      mout.status = 404;
    }

    // post hooks
    for (const hook of postHooks) {
      await callRoute(min, mout, hook.callable, hook.params);
    }

    return mout.create();
  }
}

export type Logger = (log: string, level?: "info" | "debug" | "error") => void;

export interface ApplicationOptions<T = string> {
  // deno-lint-ignore ban-types
  controller?: Function[];
  logger?: Logger | boolean;
  basePath?: T;
  router?: BaseRouter<T>;
  bodyConverter?: Array<BodyConverter>;
}
