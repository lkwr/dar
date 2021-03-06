import {
    generateRoutes,
    getStringOfRoute,
    CallableRoute,
    callRoute,
    getMatchingRoute,
    getMatchingHooks,
    CallableHook,
    mergeURLPattern,
} from './utils/Routes.ts';
import { Request as _Request, Response as _Response } from './utils/Transport.ts';
import { Metadata } from './utils/Metadata.ts';

export class Application {
    private routes: Array<CallableRoute> = [];
    private preHooks: Array<CallableHook> = [];
    private postHooks: Array<CallableHook> = [];

    private log: Logger;

    constructor(private options: ApplicationOptions) {
        // Logging
        if (typeof options.logger === 'boolean' || !options.logger) {
            this.log = options.logger
                ? (msg, level) => {
                      const now = new Date();
                      switch (level) {
                          case 'info':
                              console.log(now, msg);
                              break;
                          case 'debug':
                              console.debug(now, msg);
                              break;
                          case 'error':
                              console.error(now, msg);
                              break;
                      }
                  }
                : () => {};
        } else {
            this.log = options.logger;
        }

        this.loadController();
    }

    private loadController() {
        this.options.controller.forEach((Controller) => {
            const metadata = Metadata.getMetadata(Controller.prototype);
            if (metadata) {
                this.log(
                    'Register controller...    ' +
                        getStringOfRoute(
                            mergeURLPattern(
                                this.options.basePath || '/',
                                metadata.controller.path || '/'
                            )
                        ) +
                        (metadata.controller.name ? ` (${metadata.controller.name})` : ''),
                    'info'
                );
                const { routes, hooks } = generateRoutes(
                    metadata,
                    '/',
                    this.options.basePath,
                    this.log
                );
                this.routes = [...this.routes, ...routes];
                hooks.forEach((hook) => {
                    if (hook.level < 0) {
                        this.preHooks.push(hook);
                    } else {
                        this.postHooks.push(hook);
                    }
                });
            }
        });

        this.preHooks.sort((a, b) => (a.level || -1) - (b.level || -1));
        this.postHooks.sort((a, b) => (a.level || -1) - (b.level || -1));

        this.log(
            `Ready! Loaded ${this.routes.length} ${
                this.routes.length === 1 ? 'route' : 'routes'
            } and ${this.preHooks.length + this.postHooks.length} ${
                this.preHooks.length + this.postHooks.length === 1 ? 'hook' : 'hooks'
            }`,
            'info'
        );
    }

    async handle<C = Record<never, never>>(request: Request, context?: C): Promise<Response> {
        const res: _Response = new _Response(this, new Response());
        const req: _Request<C> = Object.assign(request, { context });
        const route = getMatchingRoute(req, this.routes);
        const preHooks = getMatchingHooks(req, this.preHooks);
        const postHooks = getMatchingHooks(req, this.postHooks);

        // pre hooks
        for (const hook of preHooks) {
            await callRoute(req, res, hook.hook, hook.match);
        }

        // main method
        if (route) {
            await callRoute(req, res, route.route, route.match);
        } else {
            res.status = 404;
        }

        // post hooks
        for (const hook of postHooks) {
            await callRoute(req, res, hook.hook, hook.match);
        }

        return res.create();
    }
}

export type Logger = (log: string, level: 'info' | 'debug' | 'error') => void;

export interface ApplicationOptions {
    // deno-lint-ignore ban-types
    controller: Function[];

    logger?: Logger | boolean;

    basePath?: URLPatternInput;
}
