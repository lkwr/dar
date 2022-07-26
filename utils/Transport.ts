// deno-lint-ignore-file no-explicit-any no-explicit-any
export class OutgoingMessage {
  headers: Headers;
  body: BodyInit | null;
  status: number | undefined;
  statusText: string | undefined;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = body ?? null;
    this.headers = new Headers(init?.headers);
    this.status = init?.status ?? 200;
    this.statusText = init?.statusText;
  }

  redirect(url: string, status?: number) {
    this.apply(Response.redirect(url, status));
  }

  apply(response: Response) {
    this.status = response.status;
    this.statusText = response.statusText;
    this.headers = response.headers;
    this.body = response.body;
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
        this.body = new String(body).toString();
        this.headers.set('content-type', 'text/plain;charset=utf-8');
        break;
      }
      default: {
        break;
      }
    }
    return this;
  }

  create(): Response {
    return new Response(this.body, {
      headers: this.headers,
      status: this.status,
      statusText: this.statusText,
    });
  }
}

export class IncomingMessage<C extends GenericContext = EmptyContext> extends Request {
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

export type GenericContext = Record<PropertyKey, unknown>;
export type EmptyContext = Record<PropertyKey, never>;
