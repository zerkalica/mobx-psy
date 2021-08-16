import type { AcmeServerRequestContentType } from '../request/Request'

export type AcmeServerResponseProps = Partial<Omit<AcmeServerResponse, 'body'>> & {
  body?: string | Buffer | NodeJS.ReadableStream | Object | undefined
}

export class AcmeServerResponse {
  readonly code = 200 as number
  readonly contentType = 'text/html' as AcmeServerRequestContentType
  readonly body = undefined as string | Buffer | NodeJS.ReadableStream | undefined

  constructor(props: AcmeServerResponseProps) {
    for (let k in this) {
      if ((props as this)[k] !== undefined) this[k] = (props as this)[k]
    }
    const body = props.body

    if (body !== null && typeof body === 'object') {
      const isStream = typeof (body as { on?: Function }).on === 'function'

      if (!(body instanceof Buffer) && !isStream) {
        if (!props.contentType) this.contentType = 'application/json'
        this.body = JSON.stringify(body)
      }
    }
  }
}
