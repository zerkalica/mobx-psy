import { isPromise, throwHidden } from '../utils'

type Primitive = string | number | boolean | object
type PackedBase = Record<string, Primitive | Primitive[]>

type Wrapped<V extends PackedBase> = {
  [P in keyof V]: () => V[P]
}

export function parallel<V extends PackedBase>(v: Wrapped<V>): V {
  const keys = Object.keys(v)
  const result = {} as V
  const promises: PromiseLike<any>[] = []
  for (let key of keys) {
    try {
      result[key as keyof V] = v[key]()
    } catch (error) {
      if (isPromise(error)) promises.push(error)
      else return throwHidden(error)
    }
  }

  if (promises.length > 0) return throwHidden(Promise.all(promises))

  return result
}
