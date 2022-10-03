// -------------------- Metadata --------------------

import { IncomingMessage, OutgoingMessage } from "../transport/Transport.ts";

export interface IMetadata<T = unknown> {
  controller: ControllerInfo<T>;
  routes: Array<MethodInfo<T> | HookInfo<T>>;
  props: Record<PropertyKey, Array<PropInfo>>;
  includes: Array<IncludeInfo<T>>;
  listeners: Array<ListenerInfo>;
}

// -------------------- Extendables --------------------

export interface Routable<T> {
  path?: T;
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

export interface ControllerInfo<T> extends Routable<T>, Describable {
  //
}

// -------------------- Route (Method & Hook) --------------------

export enum RouteType {
  METHOD,
  HOOK,
}

export interface RouteInfo<T> extends Routable<T>, Describable, Handleable {
  type: RouteType;
  property: PropertyKey;
}

// ----- Method

export enum MethodAction {
  GET = "GET",
  HEAD = "HEAD",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  CONNECT = "CONNECT",
  OPTIONS = "OPTIONS",
  TRACE = "TRACE",
  PATCH = "PATCH",
}

export interface MethodInfo<T> extends RouteInfo<T> {
  type: RouteType.METHOD;
  action: MethodAction;
}

// ----- Hook

export interface HookInfo<T> extends RouteInfo<T> {
  type: RouteType.HOOK;
  level: number;
}

// -------------------- Props --------------------

export enum PropType {
  INCOMING_MESSAGE, // Full request object
  OUTGOING_MESSAGE, // Full response object
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

export interface BodyPropInfo extends PropInfo {
  bodyType: "json" | "text" | "arrayBuffer" | "blob" | "formData" | "stream";
}

// -------------------- Include --------------------

export interface IncludeInfo<T> extends Routable<T>, Describable {
  metadata: IMetadata;
  property?: PropertyKey;
  skipControllerPath?: boolean;
}

// -------------------- Listener --------------------

export type Listener<C extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>> = (
  min: IncomingMessage<C>,
  mout: OutgoingMessage,
) => void;

export interface ListenerInfo extends Handleable, Describable {
  type: ListenerType;
  route: PropertyKey;
  order: number;
  handle: Listener;
}

export enum ListenerType {
  BEFORE, // calls before the method/hook
  AFTER, // calls after the method/hook
}
