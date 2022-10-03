import { Metadata } from "../controller/Metadata.ts";
import { Describable, Routable } from "../controller/Metadata.types.ts";

export const Include = <T = string>(
  path?: T,
  options?: Omit<IncludeOptions, "path">,
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
        path,
        description: options?.description,
        name: options?.name,
        skipControllerPath: options?.skipControllerPath,
      });
    }
  };
};

export interface IncludeOptions extends Routable<unknown>, Describable {
  skipControllerPath?: boolean;
}
