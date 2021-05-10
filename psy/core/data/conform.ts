import { psyDataCompareAny } from './compare'

const cache = new WeakMap<any, boolean>()

const psyConformStack = [] as any[]

export function psyDataConform<Target extends Record<PropertyKey, any>, Source extends Record<PropertyKey, any>>(
  target: Target,
  source: Source
): Target {
  if (psyDataCompareAny(target, source)) return source as any

  if (!target || typeof target !== 'object') return target
  if (!source || typeof source !== 'object') return target

  if (target instanceof Error) return target
  if (source instanceof Error) return target

  if (target['constructor'] !== source['constructor']) return target

  if (cache.get(target)) return target
  cache.set(target, true)

  const conform = psyConformHandlers.get(target['constructor'])
  if (!conform) return target

  if (psyConformStack.indexOf(target) !== -1) return target

  psyConformStack.push(target)

  try {
    return conform(target, source)
  } finally {
    psyConformStack.pop()
  }
}

const psyConformHandlers = new WeakMap<Object, (target: any, source: any) => any>()

export function psyDataConformHandler<Class>(cl: { new (...args: any[]): Class }, handler: (target: Class, source: Class) => Class) {
  psyConformHandlers.set(cl, handler)
}

function psyDataConformArray<
  Value,
  List extends {
    [index: number]: Value
    length: number
  }
>(target: List, source: List) {
  if (source.length !== target.length) return target

  for (let i = 0; i < target.length; ++i) {
    if (!psyDataCompareAny(source[i], target[i])) return target
  }

  return source
}

psyDataConformHandler(Array, psyDataConformArray)
psyDataConformHandler(Uint8Array, psyDataConformArray)
psyDataConformHandler(Uint16Array, psyDataConformArray)
psyDataConformHandler(Uint32Array, psyDataConformArray)

psyDataConformHandler({}['constructor'] as any, (target: Record<PropertyKey, any>, source) => {
  let count = 0
  let equal = true

  for (let key in target) {
    const Conformed = psyDataConform(target[key], source[key])

    if (Conformed !== target[key]) {
      try {
        target[key] = Conformed
      } catch (error) {}
      if (!psyDataCompareAny(Conformed, target[key])) equal = false
    }

    if (!psyDataCompareAny(Conformed, source[key])) equal = false

    ++count
  }

  for (let key in source) if (--count < 0) break

  return equal && count === 0 ? source : target
})

psyDataConformHandler(Date, (target, source) => {
  if (target.getTime() === source.getTime()) return source
  return target
})

psyDataConformHandler(RegExp, (target, source) => {
  if (target.toString() === source.toString()) return source
  return target
})
