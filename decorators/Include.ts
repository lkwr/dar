// deno-lint-ignore-file no-empty-interface
import { Routable } from '../utils/Metadata.types.ts';

export const Include = (
    path?: URLPatternInput,
    options?: IncludeOptions
): PropertyDecorator => {
    // deno-lint-ignore ban-types
    return (_target: Object, propertyKey: PropertyKey) => {
        console.log(_target, path, options, propertyKey);
        // TODO
        // const Target = _target.constructor as ObjectConstructor;
        // const target = new Target();
        // // deno-lint-ignore no-explicit-any
        // const used = (target as any)[propertyKey].prototype;
        // const usedMeta = getMetadata(used);
        // const usedRoutes: Array<MethodInfo | HookInfo> = [];
        // for (const route of usedMeta?.routes || []) {
        //     if (route.type === RouteType.METHOD) {
        //         usedRoutes.push({
        //             ...route,
        //             ...{
        //                 path: mergeURLPattern(
        //                     route.options?.absolute ? '' : path || '',
        //                     route.options?.absolute || options?.skipControllerPath
        //                         ? ''
        //                         : usedMeta?.path || '',
        //                     route.path || ''
        //                 ),
        //                 options: {
        //                     absolute: route.options?.absolute
        //                         ? route.options.absolute
        //                         : options?.absolute,
        //                 },
        //             },
        //         });
        //     } else if (route.type === RouteType.HOOK) {
        //         usedRoutes.push({
        //             ...route,
        //             ...{
        //                 path: mergeURLPattern(
        //                     route.options?.absolute ? '' : path || '',
        //                     route.options?.absolute || options?.skipControllerPath
        //                         ? ''
        //                         : usedMeta?.path || '',
        //                     route.options?.path || ''
        //                 ),
        //                 options: {
        //                     absolute: route.options?.absolute
        //                         ? route.options.absolute
        //                         : options?.absolute,
        //                 },
        //             },
        //         });
        //     }
        // }
        // addMetadata(_target, {
        //     routes: usedRoutes,
        // });
    };
};

export interface IncludeOptions extends Routable {
    // skipControllerPath?: boolean;
}
