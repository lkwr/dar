import { BodyConverter } from "./Transport.types.ts";

// deno-lint-ignore-file no-explicit-any no-explicit-any
export class OutgoingMessage<C extends BaseContext = EmptyContext> {
  headers: Headers;
  body: BodyInit | null;
  status: number | undefined;
  statusText: string | undefined;

  constructor(
    private converters: Array<BodyConverter>,
    private context?: C,
    body?: BodyInit | null,
    init?: ResponseInit,
  ) {
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

  async write(body: unknown) {
    for (const convert of this.converters) {
      const result = await convert(body, this.context);
      if (!result) continue;
      this.body = result[0];
      this.headers.set("content-type", result[1]);
      break;
    }
    if (!this.body) throw new Error("Could not convert into response body: " + body);
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

export class IncomingMessage<C extends BaseContext = EmptyContext> extends Request {
  context: C;

  constructor(request: Request, context?: C) {
    super(request);
    this.context = context ?? ({} as C);
  }

  static fromRequest<C extends Record<never, never>>(
    request: Request,
    context?: C,
  ): IncomingMessage<C> {
    return new IncomingMessage(request, context);
  }
}

export type BaseContext = Record<PropertyKey, unknown>;
export type EmptyContext = Record<PropertyKey, never>;
