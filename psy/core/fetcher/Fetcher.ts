import { PsyContext } from '../context/Context'

export interface PsyFetcherProps<P = unknown, K extends string = string> {
  kind: K
  params: P
}

export class PsyFetcher {
  static $ = PsyContext.instance
  static baseUrl = '/'

  static url(args: PsyFetcherProps) {
    return this.baseUrl + args.kind
  }

  static fetch: typeof fetch = () => {
    throw new Error('implement')
  }

  static requestId() {
    return new Date().getTime() + '_' + String(Math.floor(Math.random() * 10e9))
  }

  protected static json(args: PsyFetcherProps, init: RequestInit) {
    const res = this.fetch(this.url(args), init).then(resp => resp.json()) as PromiseLike<unknown> & {
      [Symbol.toStringTag]?: string
    }
    res.toString = () => res[Symbol.toStringTag] ?? 'Promise'

    Object.defineProperty(res, Symbol.toStringTag, {
      value: args.kind,
    })

    return res
  }

  static get(args: PsyFetcherProps, signal: AbortSignal) {
    const body = this.serializeBody(args.params)

    const init: RequestInit = {
      ...args,
      signal,
      body,
      headers: {
        'x-request-id': this.requestId(),
      },
    }

    return this.json(args, init)
  }

  static hash(p: PsyFetcherProps) {
    return p.kind + '.' + JSON.stringify(p.params)
  }

  static serializeBody(body: unknown) {
    if (
      body &&
      !(body instanceof URLSearchParams) &&
      !(typeof Blob !== 'undefined' && body instanceof Blob) &&
      !(typeof FormData !== 'undefined' && body instanceof FormData) &&
      !(typeof ReadableStream !== 'undefined' && body instanceof ReadableStream)
    )
      body = JSON.stringify(body)

    return body as Blob | FormData | URLSearchParams | ReadableStream | string
  }
}
