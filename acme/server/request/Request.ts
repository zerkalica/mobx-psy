import { psyClient } from '@psy/psy/client/client'
import { PsyFetcher } from '@psy/psy/fetcher/Fetcher'

export type AcmeServerRequestContentType = 'text/html' | 'application/json' | 'text/plain'

export class AcmeServerRequest {
  contentType(): AcmeServerRequestContentType {
    return 'text/html'
  }

  url() {
    return undefined as undefined | string
  }

  ua() {
    return 'Node client'
  }

  proto() {
    return 'http'
  }

  host() {
    return 'localhost'
  }

  location() {
    const host = this.host()
    const protocol = this.proto()
    const userAgent = this.ua()
    // IPv6 literal support
    const offset = host[0] === '[' ? host.indexOf(']') + 1 : 0
    const index = host.indexOf(':', offset)
    const hostname = index !== -1 ? host.substring(0, index) : host
    const port = index !== -1 ? host.substring(index + 1) : ''

    const href = `${protocol}://${host}${this.url()}`
    const origin = `${protocol}://${hostname}`
    const { pathname, search } = new URL(href)

    const location = {
      search,
      origin,
      pathname,
      href,
      port,
      hostname,
    }

    return {
      ...psyClient,
      location,
      navigator: {
        userAgent,
      },
    }
  }

  html() {
    return this.contentType() === 'text/html'
  }

  json() {
    return this.contentType() === 'application/json'
  }

  protected idCached = undefined as undefined | string
  id() {
    return this.idCached ?? (this.idCached = PsyFetcher.requestId())
  }

  protected sidCached = undefined as undefined | string
  sid() {
    return this.idCached ?? (this.idCached = PsyFetcher.requestId())
  }
}
