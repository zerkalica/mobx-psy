import { namedFunction, throwHidden } from '../utils'
import { Fiber } from './Fiber'

export type FetchInitBase = { signal?: AbortSignal | null }

export type FetchLike<Init extends FetchInitBase> = (
  url: string,
  init: Init
) => Promise<Object>

export type SyncFetch<Init extends FetchInitBase> = (
  url: string,
  init: Init
) => Object

export type HydratedState = Record<string, Object | undefined>

/**
 * Add fiber cache to fetch-like function.
 */
export function suspendify<Init extends FetchInitBase>(
  fetchFn: FetchLike<Init> & { displayName?: string },
  cache?: HydratedState | undefined,
  keepCache = false
): SyncFetch<Init> {
  return (url: string, init: Init) => {
    let fiber = Fiber.get<Object>(url)

    if (! fiber) {
      const fn = namedFunction((signal: AbortSignal) => {
        const data = cache ? cache[url] : undefined

        if (data === undefined) {
          const params = { ...init , signal }

          return throwHidden(fetchFn(url, params))
        }

        if (cache && !keepCache) {
          cache[url] = undefined
        }

        return data
      }, `${fetchFn.displayName ?? fetchFn.name ?? String(fetchFn)}#h`)

      fiber = new Fiber(url, fn)
    }

    return fiber.get()
  }
}
