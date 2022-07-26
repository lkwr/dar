// deno-lint-ignore-file ban-types no-explicit-any
import { join } from '../deps/std.ts';
import {
  MethodInfo,
  PropType,
  RouteType,
  HookInfo,
  IMetadata,
  PropInfo,
  ListenerInfo,
  BodyPropInfo,
  ListenerType,
} from './Metadata.types.ts';
import { IncomingMessage, OutgoingMessage } from './Transport.ts';
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
    const listeners = (metadata.listeners ?? []).filter(
      (listener) => listener.route === route.property
    );

    if (route.type === RouteType.METHOD) {
      const path = mergeURLPattern(
        basePath,
        route.absolute || controller.absolute ? '' : parentPath || '',
        route.absolute ? '' : controller.path || '',
        route.path || ''
      );

      log(
        'Register route... ' + route.method.padEnd(7, ' ') + ' ' + getStringOfRoute(path),
        'info'
      );
      if (route.handle) {
        routes.push({
          handle: route.handle,
          props: metadata.props?.[route.property] || [],
          path,
          method: route.method,
          listeners: {
            before: listeners.filter((l) => l.type === ListenerType.BEFORE),
            after: listeners.filter((l) => l.type === ListenerType.AFTER),
          },
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
          listeners: {
            before: listeners.filter((l) => l.type === ListenerType.BEFORE),
            after: listeners.filter((l) => l.type === ListenerType.AFTER),
          },
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

export const callRoute = async <C extends Record<never, never>>(
  min: IncomingMessage<C>,
  mout: OutgoingMessage,
  route: CallableRoute | CallableHook,
  match: URLPatternResult
): Promise<OutgoingMessage> => {
  const Handle = route.handle;

  const props = await generateArguments(min, mout, route, match);

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
  route: CallableRoute | CallableHook,
  match: URLPatternResult
): Promise<any[]> => {
  const args: any[] = [];
  const url = new URL(request.url);

  for (const prop of route.props || []) {
    switch (prop.type) {
      case PropType.BODY: {
        switch ((prop as BodyPropInfo).bodyType) {
          case 'json':
            args[prop.index] = await request.json();
            break;
          case 'text':
            args[prop.index] = await request.text();
            break;
          case 'arrayBuffer':
            args[prop.index] = await request.arrayBuffer();
            break;
          case 'blob':
            args[prop.index] = await request.blob();
            break;
          case 'formData':
            args[prop.index] = await request.formData();
            break;
          case 'stream':
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
  listeners: { before: Array<ListenerInfo>; after: Array<ListenerInfo> };
}

export interface CallableHook {
  handle: HookInfo['handle'];
  path: URLPattern;
  level: HookInfo['level'];
  props: Array<PropInfo>;
  listeners: { before: Array<ListenerInfo>; after: Array<ListenerInfo> };
}

interface MatchedRoute {
  route: CallableRoute;
  match: URLPatternResult;
}

interface MatchedHooks {
  hook: CallableHook;
  match: URLPatternResult;
}
