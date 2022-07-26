import { Metadata } from '../utils/Metadata.ts';
import { Describable, Listener, ListenerType } from '../utils/Metadata.types.ts';

const generateListenerDecorator = <O extends ListenerOptions>(type: ListenerType) => {
  return <C extends Record<PropertyKey, unknown>>(
    listener: Listener<C> | Array<Listener<C>>,
    options?: O
  ): MethodDecorator => {
    return (
      // deno-lint-ignore ban-types
      target: Object,
      propertyKey: PropertyKey,
      descriptor: PropertyDescriptor
    ): void | PropertyDescriptor => {
      if (!Array.isArray(listener)) listener = [listener];
      for (const listen of listener) {
        Metadata.addListener(target, {
          type,
          route: propertyKey,
          description: options?.description,
          name: options?.name,
          handle: listen as Listener,
          order: 1,
        });
      }
      descriptor.writable = false;
    };
  };
};

// deno-lint-ignore no-empty-interface
interface ListenerOptions extends Describable {}

// ----- Listener: Before -----
export const Before = generateListenerDecorator<BeforeOptions>(ListenerType.BEFORE);
// deno-lint-ignore no-empty-interface
export interface BeforeOptions extends ListenerOptions {}

// ----- Listener: After -----
export const After = generateListenerDecorator<AfterOptions>(ListenerType.AFTER);
// deno-lint-ignore no-empty-interface
export interface AfterOptions extends ListenerOptions {}
