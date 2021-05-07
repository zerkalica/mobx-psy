export interface FetchInitBase<P = unknown, K extends string = string> {
  kind: K
  params: P
}

export abstract class Fetcher {
  static $$psy = true
  static [Symbol.toStringTag] = 'Fetcher'

  abstract get(init: FetchInitBase, signal: AbortSignal): Promise<unknown>

  hash(p: FetchInitBase) {
    return p.kind + '.' + JSON.stringify(p.params)
  }

  serializeBody(body: unknown) {
    if (
      body &&
      !(body instanceof Blob) &&
      !(body instanceof FormData) &&
      !(body instanceof URLSearchParams) &&
      !(body instanceof ReadableStream)
    )
      body = JSON.stringify(body)

    return body as Blob | FormData | URLSearchParams | ReadableStream | string
  }
}
