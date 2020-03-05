import { throwHidden } from '../utils'
import { Fiber } from './Fiber'

export type FetchInitBase = { signal?: AbortSignal | null }

export type FetchLike<Init extends FetchInitBase = RequestInit> = (
  url: string,
  init: Init
) => Promise<Object>

export type SyncFetch<Init extends FetchInitBase = RequestInit> = (
  url: string,
  init: Init
) => Object

export type HydratedState = Record<string, Object | undefined>

/**
 * Add fiber cache to fetch-like function.
 */
export function fiberizeFetch<Init extends FetchInitBase = RequestInit>(
  fetchFn: FetchLike<Init>,
  cache?: HydratedState | undefined,
  keepCache = false
): SyncFetch<Init> {
  return (url: string, init: Init) => {
    let fiber = Fiber.get<Object>(url)
    if (! fiber) {
      const fn = (signal: AbortSignal) => {
        const data = cache ? (cache[url]) : undefined
        if (data === undefined)
          return throwHidden(fetchFn(url, { ...init , signal }))
        if (cache && !keepCache) cache[url] = undefined
        return data
      }

      fiber = new Fiber(url, fn)
    }

    return fiber.get()
  }
}
