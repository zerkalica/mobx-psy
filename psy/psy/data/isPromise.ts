export function psyDataIsPromise(target: any): target is PromiseLike<any> {
  return target !== null && typeof target === 'object' && typeof target.then === 'function'
}
