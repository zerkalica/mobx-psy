export function getId(t: Object, hk: string | symbol): string {
  return `${(t.constructor as any).displayName || t.constructor.name}.${hk.toString()}`
}

export function isPromise(target: any): target is PromiseLike<any> {
  return target !== null && typeof target === 'object' && typeof target.then === 'function'
}

export function namedFunction<F extends Function>(fn: F, name: string): F {
  Object.defineProperty(fn, 'name', { value: name, writable: false })
  ;(fn as any).displayName = name

  return fn
}

/**
 * Helps to disable pause in chrome dev tools while error rethrow
 */
export function throwHidden(error: Error | PromiseLike<any>): never {
  throw error // Set Never pause here in chrome devtools
}

const wm = new WeakMap<any, Error>()

/**
 * Convert non Error or PromiseLike to Error
 */
export function normalizeError(error: any): Error | PromiseLike<any> {
  if (isPromise(error) || error instanceof Error) return error

  // Weakmap used to keep instance of error with same input value
  let converted = wm.get(error)

  if (!converted) {
    converted = new Error('' + error)
    wm.set(converted, error)
  }

  return converted
}

export const errorsCollector = {
  errors: undefined as Set<Error> | undefined,
}
