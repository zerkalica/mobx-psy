import { IncomingMessage } from 'http'

import { psyClient } from '../client/client'

export function psySsrClient(req: IncomingMessage) {
  const headers = req.headers

  let protocol = headers['x-forwared-proto'] ?? 'http'
  if (Array.isArray(protocol)) protocol = protocol[0] || ''

  let host = headers['x-forwarded-host'] || headers['host'] || ''
  if (Array.isArray(host)) host = host[0] || ''

  // IPv6 literal support
  const offset: number = host[0] === '[' ? host.indexOf(']') + 1 : 0
  const index: number = host.indexOf(':', offset)
  const hostname: string = index !== -1 ? host.substring(0, index) : host
  const port: string = index !== -1 ? host.substring(index + 1) : ''

  const fullUrl = `${protocol}://${host}${req.url}`
  const parts = new URL(fullUrl)

  const location = {
    search: parts.search || '',
    origin: `${protocol}://${hostname}`,
    pathname: parts.pathname || '',
    href: fullUrl,
    port,
    hostname,
  }

  const userAgent = headers['user-agent'] ?? 'Node client'

  return {
    ...psyClient,
    location,
    navigator: {
      userAgent,
    },
  }
}
