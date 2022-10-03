import { OptionalPromise } from "../utils/Type.utils.ts";

export type BodyConverter = <T>(obj: unknown, context: T) => OptionalPromise<[BodyInit, string] | undefined>;
