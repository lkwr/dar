// deno-lint-ignore-file no-empty-interface
import { Metadata } from '../utils/Metadata.ts';
import { PropType, Describable, PropInfo } from '../utils/Metadata.types.ts';

const generatePropDecorator = <O extends PropOptions>(
    type: PropType,
    options: Partial<O> = {}
): ParameterDecorator => {
    // deno-lint-ignore ban-types
    return (target: Object, propertyKey: string | symbol, parameterIndex: number): void => {
        Metadata.addProp(target, propertyKey, {
            ...options,
            ...{
                type,
                index: parameterIndex,
            },
        });
    };
};

interface PropOptions extends Describable {}

// ----- Data: Request -----
const Request = (options?: RequestOptions) => generatePropDecorator(PropType.REQUEST, options);
export const Req = Request; // Alias

export interface RequestOptions extends PropOptions {}

// ----- Data: Response -----
const Response = (options?: ResponseOptions) =>
    generatePropDecorator(PropType.RESPONSE, options);
export const Res = Response; // Alias

export interface ResponseOptions extends PropOptions {}

// ----- Data: Param -----
export const Param = (key: string, options?: ParamOptions) =>
    generatePropDecorator(PropType.PARAM, { ...options, ...{ key } });

export interface ParamOptions extends PropOptions {}

// ----- Data: Body -----
export const Body = (model?: PropInfo['model'], options?: BodyOptions) =>
    generatePropDecorator(PropType.BODY, { ...options, ...{ model } });

export interface BodyOptions extends PropOptions {}

// ----- Data: Cookie -----
export const Cookie = (key: string, options?: CookieOptions) =>
    generatePropDecorator(PropType.COOKIE, { ...options, ...{ key } });

export interface CookieOptions extends PropOptions {}

// ----- Data: Header -----
export const Header = (key: string, options?: HeaderOptions) =>
    generatePropDecorator(PropType.HEADER, { ...options, ...{ key } });

export interface HeaderOptions extends PropOptions {}

// ----- Data: Search -----
export const Search = (key: string, options?: SearchOptions) =>
    generatePropDecorator(PropType.SEARCH, { ...options, ...{ key } });
export const Query = Search; // alias

export interface SearchOptions extends PropOptions {}

// ----- Data: Context -----
export const Context = (key?: string, options?: ContextOptions) =>
    generatePropDecorator(PropType.CONTEXT, { ...options, ...{ key } });
export const Ctx = Context; // alias

export interface ContextOptions extends PropOptions {}
