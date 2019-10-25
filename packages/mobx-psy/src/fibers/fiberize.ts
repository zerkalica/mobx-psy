import { FiberHost } from './FiberHost'
import { namedFunction } from '../utils'

/**
 * Add fiber cache to fetch-like function.
 */
export function fiberizeFetch<Result>(
  fetchFn: (...args: Parameters<typeof fetch>) => Promise<Result>
) {
  return function fiberizedFetch(info: RequestInfo, init: RequestInit = {}) {
    const method = (init ? init.method : '') || 'GET'

    let key = ''
    if (typeof info === 'string') key = `${method} ${info}`
    else key = `${info.method || method} ${info.url}`

    const fn = namedFunction(
      (signal: AbortSignal) => fetchFn(info, { ...init, signal }),
      key
    )

    return FiberHost.sync(key, fn)
  }
}
