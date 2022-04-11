// deno-lint-ignore-file ban-types no-explicit-any
import { join } from '../deps.ts';
import {
    MethodInfo,
    PropType,
    RouteType,
    HookInfo,
    IMetadata,
    PropInfo,
} from './Metadata.types.ts';
import { Response, Request } from './Transport.ts';
import { Logger } from '../Application.ts';

export const generateRoutes = (
    metadata: IMetadata,
    parentPath: URLPatternInput = '',
    basePath: URLPatternInput = '',
    log: Logger
): { routes: Array<CallableRoute>; hooks: Array<CallableHook> } => {
    const controller = metadata.controller;
    const routes: Array<CallableRoute> = [];
    const hooks: Array<CallableHook> = [];

    // Register own routes
    Object.entries(metadata.routes || []).forEach(([_key, route]) => {
        if (route.type === RouteType.METHOD) {
            const path = mergeURLPattern(
                basePath,
                route.absolute || controller.absolute ? '' : parentPath || '',
                route.absolute ? '' : controller.path || '',
                route.path || ''
            );

            log(
                'Register route... ' +
                    route.method.padEnd(7, ' ') +
                    ' ' +
                    getStringOfRoute(path),
                'info'
            );
            if (route.handle) {
                routes.push({
                    handle: route.handle,
                    props: metadata.props?.[route.property] || [],
                    path,
                    method: route.method,
                });
            }
        } else if (route.type === RouteType.HOOK) {
            const path = mergeURLPattern(
                basePath,
                route.absolute ? '' : parentPath,
                route.absolute ? '' : controller.path || '',
                route.path || ''
            );

            log(
                'Register hook...  ' +
                    ('[' + route.level + '] ').padEnd(8, ' ') +
                    getStringOfRoute(path),
                'info'
            );
            if (route.handle) {
                hooks.push({
                    handle: route.handle,
                    props: metadata.props?.[route.property] || [],
                    path,
                    level: route.level,
                });
            }
        }
    });

    // Register included controller routes
    (metadata.includes || []).forEach((include) => {
        if (include.skipControllerPath) {
            include.metadata.controller.path = include.path;
        } else {
            include.metadata.controller.path = mergeURLPattern(
                include.path || '',
                include.metadata.controller.path || ''
            );
        }

        const includedPath = mergeURLPattern(
            include.absolute ? '' : parentPath,
            include.absolute ? '' : controller.path || ''
        );
        log(
            'Register included...      ' +
                getStringOfRoute(
                    mergeURLPattern(
                        basePath,
                        include.metadata.controller.absolute ? '' : includedPath,
                        include.metadata.controller.path || ''
                    )
                ),
            'info'
        );
        const { routes: includedRoutes, hooks: includedHooks } = generateRoutes(
            include.metadata,
            includedPath,
            basePath,
            log
        );

        routes.push(...includedRoutes);
        hooks.push(...includedHooks);
    });

    return { routes, hooks };
};

export const normalizePath = (...path: string[]): string => {
    const joined = join('/', ...path, '/');
    if (joined.length !== 1) {
        return joined.slice(0, -1);
    } else {
        return joined;
    }
};

const normalizeURL = (urlString: string): string => {
    const url = new URL(urlString);

    url.pathname = normalizePath(url.pathname);

    return url.toString();
};

export const mergeURLPattern = (
    base: URLPatternInput,
    ...others: Array<URLPatternInput>
): URLPattern => {
    const formatedOther = [];
    if (typeof base === 'string') {
        base = { pathname: base };
    }
    for (const item of others) {
        if (typeof item === 'string') {
            formatedOther.push({ pathname: item });
        } else {
            formatedOther.push(item);
        }
    }

    const mergedInput: URLPatternInput = { ...base, ...{ ...formatedOther } };

    mergedInput.pathname = normalizePath(base.pathname || '');

    for (const item of formatedOther) {
        mergedInput.pathname = normalizePath(mergedInput.pathname, item.pathname || '');
    }

    return new URLPattern(mergedInput);
};

export const callRoute = async (
    request: Request,
    response: Response,
    route: CallableRoute | CallableHook,
    match: URLPatternResult
): Promise<Response> => {
    const Handle = route.handle;

    const result = (Handle as Function).call(
        undefined,
        ...generateArguments(request, response, route, match)
    );

    if (result !== undefined) {
        if (result instanceof Promise) {
            return handleResponse(await result, response);
        } else {
            return handleResponse(result, response);
        }
    } else {
        return response;
    }
};

const generateArguments = (
    request: Request,
    response: Response,
    route: CallableRoute | CallableHook,
    match: URLPatternResult
): any[] => {
    const args: any[] = [];
    const url = new URL(request.url);

    (route.props || []).forEach((prop) => {
        switch (prop.type) {
            case PropType.CONTEXT: {
                if (prop.key) {
                    args[prop.index] = (request.context as any)[prop.key];
                } else {
                    args[prop.index] = request.context;
                }
                break;
            }
            case PropType.PARAM: {
                args[prop.index] = match.pathname.groups[prop.key!];
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
            case PropType.REQUEST: {
                args[prop.index] = request;
                break;
            }
            case PropType.RESPONSE: {
                args[prop.index] = response;
                break;
            }
            default: {
                args[prop.index] = undefined;
            }
        }
    });

    return args;
};

const handleResponse = (data: unknown, response: Response): Response => {
    response.write(data);
    return response;
};

export const getMatchingRoute = (
    request: Request,
    routes: CallableRoute[]
): MatchedRoute | null => {
    let match: URLPatternResult | null = null;
    let matchRoute: CallableRoute | null = null;

    for (const route of routes) {
        match = route.path.exec(normalizeURL(request.url));

        if (match && request.method.toUpperCase() === route.method?.toUpperCase()) {
            matchRoute = route;
            break;
        }
    }

    if (match && matchRoute) {
        return { match, route: matchRoute };
    } else {
        return null;
    }
};

export const getMatchingHooks = (request: Request, hooks: CallableHook[]): MatchedHooks[] => {
    const matched: MatchedHooks[] = [];

    for (const hook of hooks) {
        const match = hook.path.exec(normalizeURL(request.url));

        if (match) {
            matched.push({ match, hook });
        }
    }

    return matched;
};

export const getStringOfRoute = (route: URLPatternInput): string => {
    if (typeof route === 'string') {
        return normalizePath(route);
    } else {
        return [
            normalizePath(route.pathname || ''),
            route.hostname && route.hostname !== '*' ? `(${route.hostname})` : undefined,
        ].join(' ');
    }
};

export interface CallableRoute {
    handle: MethodInfo['handle'];
    path: URLPattern;
    method: MethodInfo['method'];
    props: Array<PropInfo>;
}

export interface CallableHook {
    handle: HookInfo['handle'];
    path: URLPattern;
    level: HookInfo['level'];
    props: Array<PropInfo>;
}

interface MatchedRoute {
    route: CallableRoute;
    match: URLPatternResult;
}

interface MatchedHooks {
    hook: CallableHook;
    match: URLPatternResult;
}
