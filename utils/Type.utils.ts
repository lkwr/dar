// deno-lint-ignore-file ban-types
export type OptionalPromise<T> = Promise<T> | T;

export type Replace<O extends Object, K extends keyof O, T> = Omit<O, K> & Record<K, T>;
