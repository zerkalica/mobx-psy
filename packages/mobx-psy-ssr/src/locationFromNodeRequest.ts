import { IncomingMessage } from 'http'
import { parse } from 'url'
import { LocationLike } from 'mobx-psy'

export function locationFromNodeRequest(
  req: IncomingMessage,
  sequre = true
): LocationLike {
  const parts = parse(req.url || '')
  const headers = req.headers
  let host = headers['x-forwarded-host'] || headers['host'] || ''
  if (Array.isArray(host)) host = host[0] || ''

  let protocol = headers['x-forwared-proto'] || (sequre ? 'https' : 'http')
  if (Array.isArray(protocol)) protocol = protocol[0] || ''

  // IPv6 literal support
  const offset: number = host[0] === '[' ? host.indexOf(']') + 1 : 0
  const index: number = host.indexOf(':', offset)
  const hostname: string = index !== -1 ? host.substring(0, index) : host
  const port: string = index !== -1 ? host.substring(index + 1) : ''

  const location: LocationLike = {
    search: parts.search || '',
    origin: `${protocol}://${hostname}`,
    pathname: parts.pathname || '',
    port,
    hostname,
  }

  return location
}

