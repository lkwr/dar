import { Metadata } from '../utils/Metadata.ts';
import { Routable, Describable } from '../utils/Metadata.types.ts';

export const Include = (
    path?: URLPatternInput,
    options?: IncludeOptions
): PropertyDecorator => {
    // deno-lint-ignore ban-types
    return (_target: Object, propertyKey: PropertyKey) => {
        const Target = _target.constructor as ObjectConstructor;
        const target = new Target();
        // deno-lint-ignore no-explicit-any
        const included = (target as any)[propertyKey].prototype;

        const includedMetadata = Metadata.getMetadata(included);

        if (includedMetadata) {
            Metadata.addInclude(_target, {
                metadata: includedMetadata,
                property: propertyKey,
                absolute: options?.absolute,
                path: path || options?.path,
                description: options?.description,
                name: options?.name,
                skipControllerPath: options?.skipControllerPath,
            });
        }
    };
};

export interface IncludeOptions extends Routable, Describable {
    skipControllerPath?: boolean;
}
