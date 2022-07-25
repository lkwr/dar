// deno-lint-ignore-file
import {
  IMetadata,
  ControllerInfo,
  RouteInfo,
  PropInfo,
  IncludeInfo,
} from './Metadata.types.ts';
import { deepMerge } from '../deps/std.ts';

const MetadataSymbol = Symbol('controller metadata');

export namespace Metadata {
  export const setController = (obj: Object, controller: ControllerInfo) => {
    set(obj, { controller });
  };

  export const addRoute = <R extends RouteInfo>(obj: Object, route: R) => {
    set(obj, { routes: [route] });
  };

  export const addProp = (obj: Object, key: PropertyKey, prop: PropInfo) => {
    set(obj, { props: { [key]: [prop] } });
  };

  export const addInclude = (obj: Object, included: IncludeInfo) => {
    set(obj, { includes: [included] });
  };

  export const getMetadata = (obj: Object): IMetadata | undefined => {
    return get(obj);
  };
}

const define = (obj: Object, init: any) => {
  let meta: any = init;

  const set = (value: any) => {
    meta = deepMerge(meta, value);
  };

  const get = () => {
    return meta;
  };

  Object.defineProperty(obj, MetadataSymbol, { get, set });
};

const contains = (obj: Object): boolean => {
  return Object.getOwnPropertySymbols(obj).includes(MetadataSymbol);
};

const get = (obj: Object) => {
  return (<any>obj)[MetadataSymbol];
};

const set = (obj: Object, value: any) => {
  if (!contains(obj)) {
    define(obj, value);
  } else {
    (<any>obj)[MetadataSymbol] = value;
  }
};
