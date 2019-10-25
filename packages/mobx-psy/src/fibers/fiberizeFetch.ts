import { throwHidden } from '../utils'
import { Fiber } from './Fiber'

export type FetchBaseParams = Pick<RequestInit, 'method' | 'signal'>

export type FetchLike<Result = any, Params extends FetchBaseParams = any> = (
  url: string,
  init: Params
) => Promise<Result>

type SerializableItem = string | number | null | object
export type Serializable = SerializableItem | SerializableItem[]
export type StateItem = [string, Serializable]

/**
 * Add fiber cache to fetch-like function.
 */
export function fiberizeFetch(
  fetchFn: FetchLike,
  cache?: Map<string, Serializable> | undefined,
) {
  return <Result, Params extends Pick<RequestInit, 'method'> = {}>(
    url: string,
    init: Params
  ) => {
    const id = `${(init && init.method) || 'GET'} ${url}`
    let fiber = Fiber.get<Result>(id)
    if (!fiber) {
      const fn = (signal: AbortSignal) => {
        const data = cache ? cache.get(url) : undefined
        if (data === undefined)
          return throwHidden(fetchFn(url, { ...init, signal }))
        if (cache) cache.delete(url)
        return data
      }

      fiber = new Fiber(id, fn)
    }

    return fiber.get()
  }
}
