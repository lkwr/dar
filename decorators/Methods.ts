import { Metadata } from '../utils/Metadata.ts';
import {
    MethodType,
    RouteType,
    MethodInfo,
    Routable,
    Describable,
} from '../utils/Metadata.types.ts';

const generateMethodDecorator = <O extends MethodOptions>(method: MethodType) => {
    return (path: URLPatternInput = '/', options?: O): MethodDecorator => {
        return (
            // deno-lint-ignore ban-types
            target: Object,
            propertyKey: PropertyKey,
            descriptor: PropertyDescriptor
        ): void | PropertyDescriptor => {
            Metadata.addRoute<MethodInfo>(target, propertyKey, {
                type: RouteType.METHOD,
                path,
                // deno-lint-ignore ban-types
                handle: descriptor.value as Function,
                method,
                absolute: options?.absolute,
                description: options?.description,
                name: options?.name,
            });
            descriptor.writable = false;
        };
    };
};

interface MethodOptions extends Routable, Describable {}

// ----- Method: GET -----
export const Get = generateMethodDecorator<GetOptions>(MethodType.GET);
// deno-lint-ignore no-empty-interface
export interface GetOptions extends MethodOptions {}

// ----- Method: HEAD -----
export const Head = generateMethodDecorator<HeadOptions>(MethodType.HEAD);
// deno-lint-ignore no-empty-interface
export interface HeadOptions extends MethodOptions {}

// ----- Method: POST -----
export const Post = generateMethodDecorator<PostOptions>(MethodType.POST);
// deno-lint-ignore no-empty-interface
export interface PostOptions extends MethodOptions {}

// ----- Method: PUT -----
export const Put = generateMethodDecorator<PutOptions>(MethodType.PUT);
// deno-lint-ignore no-empty-interface
export interface PutOptions extends MethodOptions {}

// ----- Method: DELETE -----
export const Delete = generateMethodDecorator<DeleteOptions>(MethodType.DELETE);
// deno-lint-ignore no-empty-interface
export interface DeleteOptions extends MethodOptions {}

// ----- Method: CONNECT -----
export const Connect = generateMethodDecorator<ConnectOptions>(MethodType.CONNECT);
// deno-lint-ignore no-empty-interface
export interface ConnectOptions extends MethodOptions {}

// ----- Method: OPTIONS -----
export const Options = generateMethodDecorator<OptionsOptions>(MethodType.OPTIONS);
// deno-lint-ignore no-empty-interface
export interface OptionsOptions extends MethodOptions {}

// ----- Method: TRACE -----
export const Trace = generateMethodDecorator<TraceOptions>(MethodType.TRACE);
// deno-lint-ignore no-empty-interface
export interface TraceOptions extends MethodOptions {}

// ----- Method: PATCH -----
export const Patch = generateMethodDecorator<PatchOptions>(MethodType.PATCH);
// deno-lint-ignore no-empty-interface
export interface PatchOptions extends MethodOptions {}
