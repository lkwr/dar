// deno-lint-ignore-file no-empty-interface

export interface DefaultOptions {
    name?: string;
    description?: string;
}

export interface PathOptions extends DefaultOptions {
    /**
     * If path is absolute
     */
    absolute?: boolean;
}

export interface MethodOptions extends PathOptions {}

export interface DataOptions extends DefaultOptions {}

export interface ControllerOptions extends DefaultOptions {}

export interface HookOptions extends PathOptions {
    path?: URLPatternInput;
}
