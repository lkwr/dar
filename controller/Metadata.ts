// deno-lint-ignore-file
import {
  ControllerInfo,
  HookInfo,
  IMetadata,
  IncludeInfo,
  ListenerInfo,
  MethodInfo,
  PropInfo,
} from "./Metadata.types.ts";
import { deepMerge } from "../deps/std.ts";

const MetadataSymbol = Symbol("controller metadata");

export class Metadata {
  static setController<T = string>(obj: Object, controller: ControllerInfo<T>) {
    set(obj, { controller });
  }

  static addRoute<T = string>(obj: Object, route: MethodInfo<T> | HookInfo<T>) {
    set(obj, { routes: [route] });
  }

  static addListener(obj: Object, listener: ListenerInfo) {
    set(obj, { listeners: [listener] });
  }

  static addProp(obj: Object, key: PropertyKey, prop: PropInfo) {
    set(obj, { props: { [key]: [prop] } });
  }

  static addInclude<T = string>(obj: Object, included: IncludeInfo<T>) {
    set(obj, { includes: [included] });
  }

  static getMetadata(obj: Object): IMetadata | undefined {
    return get(obj);
  }
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
  return (<any> obj)[MetadataSymbol];
};

const set = (obj: Object, value: Partial<IMetadata>) => {
  if (!contains(obj)) {
    define(obj, value);
  } else {
    (<any> obj)[MetadataSymbol] = value;
  }
};
