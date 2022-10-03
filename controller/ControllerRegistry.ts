import { Metadata } from "./Metadata.ts";
import { IMetadata } from "./Metadata.types.ts";

export class ControllerRegistry {
  private static instance: ControllerRegistry | undefined;

  private controllers: Array<IMetadata> = [];

  // deno-lint-ignore ban-types
  register(controller: Function): boolean {
    const metadata = Metadata.getMetadata(controller.prototype);
    if (!metadata) return false;

    this.controllers.push(metadata);
    return true;
  }

  getControllers<T>(): Array<IMetadata<T>> {
    return this.controllers as Array<IMetadata<T>>;
  }

  static get(): ControllerRegistry {
    if (!ControllerRegistry.instance) {
      ControllerRegistry.instance = new ControllerRegistry();
    }
    return ControllerRegistry.instance;
  }
}
