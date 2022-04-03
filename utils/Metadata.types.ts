// -------------------- Metadata --------------------

export interface IMetadata {
    controller: ControllerInfo;
    routes: Record<PropertyKey, MethodInfo | HookInfo>;
    props: Record<PropertyKey, Array<PropInfo>>;
    includes: Record<PropertyKey, IncludeInfo>;
}

// -------------------- Extendables --------------------

export interface Routable {
    path?: URLPatternInput;
    absolute?: boolean;
}

export interface Describable {
    name?: string;
    description?: string;
}

export interface Handleable {
    // deno-lint-ignore ban-types
    handle: Function;
}

// -------------------- Controller --------------------

export interface ControllerInfo extends Routable, Describable {
    //
}

// -------------------- Route (Method & Hook) --------------------

export enum RouteType {
    METHOD,
    HOOK,
}

export interface RouteInfo extends Routable, Describable, Handleable {
    type: RouteType;
}

// ----- Method

export enum MethodType {
    GET = 'GET',
    HEAD = 'HEAD',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    CONNECT = 'CONNECT',
    OPTIONS = 'OPTIONS',
    TRACE = 'TRACE',
    PATCH = 'PATCH',
}

export interface MethodInfo extends RouteInfo {
    type: RouteType.METHOD;
    method: MethodType;
}

// ----- Hook

export interface HookInfo extends RouteInfo {
    type: RouteType.HOOK;
    level: number;
}

// -------------------- Props --------------------

export enum PropType {
    REQUEST, // Full request object
    RESPONSE, // Full response object
    PARAM, // A parameterd defined via placeholder in path (example: "/hello/:name/")
    BODY, // The body object (with options only a specific key (if format is supported))
    COOKIE, // A cookie value
    HEADER, // A header value
    SEARCH, // A query from the url
    CONTEXT, // specific provided context (can be provided in a hook as example and access in a method, can be used for user object or so)
}

export interface PropInfo extends Describable {
    type: PropType;
    index: number;
    key?: string;
}

// -------------------- Include --------------------

export interface IncludeInfo extends Routable, Describable {
    metadata: IMetadata;
}
