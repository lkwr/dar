// deno-lint-ignore-file no-explicit-any no-explicit-any
import { Application } from '../Application.ts';

class _Response {
    readonly app: Application;

    headers: Headers;
    body: any = '';
    status: number | undefined;

    constructor(app: Application, response?: ResponseInit) {
        this.app = app;
        this.headers = new Headers(response?.headers);
        this.status = response?.status || 200;
    }

    redirect(url: string, status?: number) {
        this.apply(Response.redirect(url, status));
    }

    apply(response: Response) {
        this.status = response.status;
        response.headers.forEach((value, key) => {
            this.headers.set(key, value);
        });
    }

    // TODO
    // write body an automaticly set content-type
    // use plugin system
    write(body: any) {
        this.body = body;
        this.headers.set('content-type', 'application/json'); // TODO change dynamicly
    }

    create(): Response {
        return new Response(this.body, {
            headers: this.headers,
            status: this.status,
        });
    }
}

type _Request<C = Record<never, never>> = Request & { context?: C };

export { _Response as Response };
export type { _Request as Request };
