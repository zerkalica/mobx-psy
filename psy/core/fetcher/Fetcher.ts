export interface PsyFetcherProps<P = unknown, K extends string = string> {
  kind: K
  params: P
}

export class PsyFetcher {
  static baseUrl = '/'
  static url(args: PsyFetcherProps) {
    return this.baseUrl + args.kind
  }

  static fetch: typeof fetch = () => {
    throw new Error('implement')
  }

  static async get(args: PsyFetcherProps, signal: AbortSignal) {
    const body = this.serializeBody(args.params)

    const init: RequestInit = {
      ...args,
      signal,
      body,
    }

    const resp = await this.fetch(this.url(args), init)

    return resp.json()
  }

  static hash(p: PsyFetcherProps) {
    return p.kind + '.' + JSON.stringify(p.params)
  }

  static serializeBody(body: unknown) {
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
