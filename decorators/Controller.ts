import { Metadata } from '../utils/Metadata.ts';
import { Describable, Routable } from '../utils/Metadata.types.ts';

export const Controller = (
    path: URLPatternInput = '/',
    options?: ControllerOptions
): ClassDecorator => {
    // deno-lint-ignore ban-types
    return <TFunction extends Function>(target: TFunction): void | TFunction => {
        Metadata.setController(target.prototype, {
            path,
            absolute: options?.absolute,
            name: options?.name,
            description: options?.description,
        });
    };
};

interface ControllerOptions extends Describable, Routable {}
