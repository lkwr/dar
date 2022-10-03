import { ControllerRegistry } from "../controller/ControllerRegistry.ts";
import { Metadata } from "../controller/Metadata.ts";
import { Describable, Routable } from "../controller/Metadata.types.ts";

// TODO remove default path -> make path optionally because it wont work with custom routing plugins
export const Controller = <T = string>(
  path: T = "/" as T,
  options?: Omit<ControllerOptions, "path">,
): ClassDecorator => {
  // deno-lint-ignore ban-types
  return <TFunction extends Function>(target: TFunction): void | TFunction => {
    Metadata.setController(target.prototype, {
      path,
      absolute: options?.absolute,
      name: options?.name,
      description: options?.description,
    });

    (options?.include || []).forEach((Controller) => {
      const includedMetadata = Metadata.getMetadata(Controller.prototype);
      if (includedMetadata) {
        Metadata.addInclude(target.prototype, {
          metadata: includedMetadata,
        });
      }
    });

    if (options?.register !== false) {
      ControllerRegistry.get().register(target);
    }
  };
};

interface ControllerOptions extends Describable, Routable<unknown> {
  // deno-lint-ignore ban-types
  include?: Function[];
  register?: boolean;
}
