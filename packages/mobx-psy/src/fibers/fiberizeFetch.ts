import { throwHidden } from '../utils'
import { Fiber } from './Fiber'

export type FetchInitBase = { signal?: AbortSignal | null }

export type FetchLike<Init extends FetchInitBase = any> = <Result>(
  url: string,
  init: Init
) => Promise<Result>

export type SyncFetch<Init extends FetchInitBase = any> = <Result>(
  url: string,
  init: Init
) => Result

export type HydratedState = Record<string, any>

/**
 * Add fiber cache to fetch-like function.
 */
export function fiberizeFetch<Init extends FetchInitBase>(
  fetchFn: FetchLike<Init>,
  cache?: HydratedState | undefined,
  keepCache = false
): SyncFetch<Init> {
  return <Result, Params extends Init = Init>(url: string, init: Params) => {
    let fiber = Fiber.get<Result>(url)
    if (!fiber) {
      const fn = (signal: AbortSignal) => {
        const data = cache ? (cache[url] as Result) : undefined
        if (data === undefined)
          return throwHidden(fetchFn(url, { ...init, signal }))
        if (cache && !keepCache) cache[url] = undefined
        return data
      }

      fiber = new Fiber(url, fn)
    }

    return fiber.get()
  }
}
