// deno-lint-ignore-file
import { Metadata } from "../controller/Metadata.ts";
import { Describable, Routable, RouteType } from "../controller/Metadata.types.ts";

export const Hook = <T = string>(level: number = -1, options?: HookOptions<T>): MethodDecorator => {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void | PropertyDescriptor => {
    Metadata.addRoute(target, {
      type: RouteType.HOOK,
      level: level,
      handle: descriptor.value as Function,
      path: options?.path || "*?",
      absolute: options?.absolute,
      description: options?.description,
      name: options?.name,
      property: propertyKey,
    });
    descriptor.writable = false;
  };
};

interface HookOptions<T> extends Routable<T>, Describable {}
