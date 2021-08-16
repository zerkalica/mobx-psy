import { psyDataIsPromise } from '../data/isPromise'
import { psyErrorThrowHidden } from '../error/hidden'
import { PsyErrorMix } from '../error/Mix'

type Primitive = string | number | boolean | object
type PackedBase = Record<string, Primitive | Primitive[]>

type Wrapped<V extends PackedBase> = {
  [P in keyof V]: () => V[P]
}

/**
 * Execute suspendable calculations in parallel
 *
 * ```ts
 * const { a, b } = parallel({
 *   a: () => some.a // can throw Error | PromiseLike
 *   b: () => some.b // can throw Error | PromiseLike
 * })
 * ```
 */
export function psySyncParallel<V extends PackedBase>(v: Wrapped<V>): V {
  const keys = Object.keys(v)
  const result = {} as V
  const promises: PromiseLike<any>[] = []
  const errors = [] as Error[]

  for (let key of keys) {
    try {
      result[key as keyof V] = v[key]()
    } catch (error) {
      if (psyDataIsPromise(error)) promises.push(error)
      else errors.push(error)
    }
  }

  if (errors.length > 0) return psyErrorThrowHidden(errors.length === 1 ? errors[0] : new PsyErrorMix('Parallel', errors))
  if (promises.length > 0) return psyErrorThrowHidden(Promise.all(promises))

  return result
}
