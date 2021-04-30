import { namedFunction, throwHidden } from '../utils'
import { Fiber } from './Fiber'

export interface FetchInitBase {
  kind: string
  params: Object
}

export type FetchLike = (init: FetchInitBase, signal: AbortSignal) => Promise<Object>

export type SyncFetch = (init: FetchInitBase) => Object

export const defaultHashFn = (p: FetchInitBase) => p.kind + '.' + JSON.stringify(p.params)

/**
 * Add fiber cache to fetch-like function.
 */
export function suspendify({
  fetchFn,
  cache,
  keepCache = false,
  hashFn = defaultHashFn,
}: {
  fetchFn: FetchLike & { displayName?: string }
  cache?: Record<string, Object | undefined>
  keepCache?: boolean
  hashFn?: typeof defaultHashFn
}) {
  function syncFetch(args: FetchInitBase) {
    const key = hashFn(args)
    let fiber = Fiber.get<Object>(key)

    if (!fiber) {
      const fn = namedFunction((signal: AbortSignal) => {
        const data: Object | undefined = cache ? cache[key] : undefined

        if (data === undefined) return throwHidden(fetchFn(args, signal))

        if (cache && !keepCache) cache[key] = undefined

        return data
      }, `${fetchFn.displayName ?? fetchFn.name ?? String(fetchFn)}#h`)

      fiber = new Fiber<Object>(key, fn)
    }

    return fiber.get()
  }

  return syncFetch
}
