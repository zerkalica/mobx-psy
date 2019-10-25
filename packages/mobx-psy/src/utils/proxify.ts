import { throwHidden } from './common'

const origId = Symbol('original')

type ProxyTarget<V = any> = (Error | PromiseLike<any>) & {
  [origId]?: V
}

const throwOnAccess: ProxyHandler<ProxyTarget> = {
  get<V extends Object>(target: ProxyTarget, key: string | symbol): V {
    if (key === origId) return target.valueOf() as V
    return throwHidden(target.valueOf() as ProxyTarget)
  },
  ownKeys(target: ProxyTarget): string[] {
    return throwHidden(target.valueOf() as ProxyTarget)
  },
}

export function proxify<V>(v: ProxyTarget<V>): V {
  return ((v[origId] ? v : new Proxy(v, throwOnAccess)) as unknown) as V
}
