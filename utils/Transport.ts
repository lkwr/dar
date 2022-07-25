// deno-lint-ignore-file no-explicit-any no-explicit-any
import { Application } from '../Application.ts';

export class OutgoingMessage {
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
  // use plugin system (make customizable)
  write(body: any) {
    switch (typeof body) {
      case 'object': {
        this.body = JSON.stringify(body);
        this.headers.set('content-type', 'application/json;charset=utf-8');
        break;
      }
      case 'string':
      case 'boolean':
      case 'number': {
        this.body = new String(body);
        this.headers.set('content-type', 'text/plain;charset=utf-8');
        break;
      }
      default: {
        break;
      }
    }
  }

  create(): Response {
    return new Response(this.body, {
      headers: this.headers,
      status: this.status,
    });
  }
}

export class IncomingMessage<
  C extends Record<PropertyKey, any> = Record<never, never>
> extends Request {
  context: C;

  constructor(request: Request, context?: C) {
    super(request);
    this.context = context ?? ({} as C);
  }

  static fromRequest<C extends Record<never, never>>(
    request: Request,
    context?: C
  ): IncomingMessage<C> {
    return new IncomingMessage(request, context);
  }
}
