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

        (options?.include || []).forEach((Controller) => {
            const includedMetadata = Metadata.getMetadata(Controller.prototype);
            if (includedMetadata) {
                Metadata.addInclude(target.prototype, {
                    metadata: includedMetadata,
                });
            }
        });
    };
};

interface ControllerOptions extends Describable, Routable {
    // deno-lint-ignore ban-types
    include?: Function[];
}
