import { PsyContext } from '../context/Context'
import { PsyTrace } from '../trace/trace'

export interface PsyFetcherProps<P = unknown, K extends string = string> {
  kind: K
  params: P
}

export class PsyFetcher {
  static $ = PsyContext.instance
  static baseUrl = '/'
  static requestId = undefined as string | undefined

  static url(args: PsyFetcherProps) {
    return this.baseUrl + args.kind
  }

  static fetch: typeof fetch = () => {
    throw new Error('implement')
  }

  protected static get trace() {
    return this.$.get(PsyTrace)
  }

  static get(args: PsyFetcherProps, signal: AbortSignal) {
    const body = this.serializeBody(args.params)
    const sessionId = this.trace.sessionId
    const requestId = this.trace.requestId()

    const init: RequestInit = {
      ...args,
      signal,
      body,
      headers: {
        'x-request-id': requestId,
        'x-session-id': sessionId,
      },
    }

    const res = this.fetch(this.url(args), init).then(resp => resp.json()) as PromiseLike<unknown> & {
      [Symbol.toStringTag]?: string
    }
    res.toString = () => res[Symbol.toStringTag] ?? 'Promise'

    res[Symbol.toStringTag] = args.kind

    return res
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
