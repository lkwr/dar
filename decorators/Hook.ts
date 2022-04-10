// deno-lint-ignore-file
import { Metadata } from '../utils/Metadata.ts';
import { Routable, Describable, RouteType, HookInfo } from '../utils/Metadata.types.ts';

export const Hook = (level: number = -1, options?: HookOptions): MethodDecorator => {
    return (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ): void | PropertyDescriptor => {
        Metadata.addRoute<HookInfo>(target, {
            type: RouteType.HOOK,
            level: level,
            handle: descriptor.value as Function,
            path: options?.path || '*?',
            absolute: options?.absolute,
            description: options?.description,
            name: options?.name,
            property: propertyKey,
        });
        descriptor.writable = false;
    };
};

interface HookOptions extends Routable, Describable {}
