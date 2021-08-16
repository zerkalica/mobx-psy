import { psyFunctionName } from '../function/name'

export function psyObjectSetter<T extends Record<string, unknown>, K extends keyof T = keyof T>(push: (k: K, v: T[K]) => void) {
  const setters = new Map<string | symbol, (v: T[K]) => void>()

  return new Proxy({} as { [K in keyof T]-?: (v: T[K]) => void }, {
    get(t, k) {
      let setter = setters.get(k)

      if (setter !== undefined) return setter

      setter = psyFunctionName(push.bind(null, k as K), `set_${k as string}`)
      setters.set(k, setter)

      return setter
    },
  })
}
