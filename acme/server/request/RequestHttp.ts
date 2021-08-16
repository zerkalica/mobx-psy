import { IncomingMessage } from 'http'

import { AcmeServerRequest, AcmeServerRequestContentType } from './Request'

export class AcmeServerRequestHttp extends AcmeServerRequest {
  constructor(protected req: IncomingMessage) {
    super()
  }

  url() {
    return this.req.url
  }

  ua() {
    return this.req.headers['user-agent'] ?? super.ua()
  }

  proto() {
    let protocol = this.req.headers['x-forwared-proto'] ?? 'http'
    if (Array.isArray(protocol)) protocol = protocol[0] || ''

    return protocol
  }

  host() {
    let host = this.req.headers['x-forwarded-host'] || this.req.headers['host'] || ''
    if (Array.isArray(host)) host = host[0] || ''

    return host
  }

  contentType() {
    return (this.req.headers['content-type'] as AcmeServerRequestContentType) ?? 'text/html'
  }

  id() {
    return (this.req.headers['x-request-id'] as string | undefined) ?? super.id()
  }

  sid() {
    return (this.req.headers['x-session-id'] as string | undefined) ?? super.sid()
  }
}
