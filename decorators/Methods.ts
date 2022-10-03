import { Metadata } from "../controller/Metadata.ts";
import { Describable, MethodAction, Routable, RouteType } from "../controller/Metadata.types.ts";

const generateMethodDecorator = <O extends MethodOptions>(
  action: MethodAction,
) => {
  return <T = string>(path: T = "/" as T, options?: Omit<O, "path">): MethodDecorator => {
    return (
      // deno-lint-ignore ban-types
      target: Object,
      propertyKey: PropertyKey,
      descriptor: PropertyDescriptor,
    ): void | PropertyDescriptor => {
      Metadata.addRoute(target, {
        type: RouteType.METHOD,
        path,
        // deno-lint-ignore ban-types
        handle: descriptor.value as Function,
        action,
        absolute: options?.absolute,
        description: options?.description,
        name: options?.name,
        property: propertyKey,
      });
      descriptor.writable = false;
    };
  };
};

interface MethodOptions extends Routable<unknown>, Describable {}

// ----- Method: GET -----
export const Get = generateMethodDecorator<GetOptions>(MethodAction.GET);
// deno-lint-ignore no-empty-interface
export interface GetOptions extends MethodOptions {}

// ----- Method: HEAD -----
export const Head = generateMethodDecorator<HeadOptions>(MethodAction.HEAD);
// deno-lint-ignore no-empty-interface
export interface HeadOptions extends MethodOptions {}

// ----- Method: POST -----
export const Post = generateMethodDecorator<PostOptions>(MethodAction.POST);
// deno-lint-ignore no-empty-interface
export interface PostOptions extends MethodOptions {}

// ----- Method: PUT -----
export const Put = generateMethodDecorator<PutOptions>(MethodAction.PUT);
// deno-lint-ignore no-empty-interface
export interface PutOptions extends MethodOptions {}

// ----- Method: DELETE -----
export const Delete = generateMethodDecorator<DeleteOptions>(MethodAction.DELETE);
// deno-lint-ignore no-empty-interface
export interface DeleteOptions extends MethodOptions {}

// ----- Method: CONNECT -----
export const Connect = generateMethodDecorator<ConnectOptions>(
  MethodAction.CONNECT,
);
// deno-lint-ignore no-empty-interface
export interface ConnectOptions extends MethodOptions {}

// ----- Method: OPTIONS -----
export const Options = generateMethodDecorator<OptionsOptions>(
  MethodAction.OPTIONS,
);
// deno-lint-ignore no-empty-interface
export interface OptionsOptions extends MethodOptions {}

// ----- Method: TRACE -----
export const Trace = generateMethodDecorator<TraceOptions>(MethodAction.TRACE);
// deno-lint-ignore no-empty-interface
export interface TraceOptions extends MethodOptions {}

// ----- Method: PATCH -----
export const Patch = generateMethodDecorator<PatchOptions>(MethodAction.PATCH);
// deno-lint-ignore no-empty-interface
export interface PatchOptions extends MethodOptions {}
