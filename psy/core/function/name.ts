export function psyFunctionName<F extends Function & { displayName?: string }>(fn: F, name: string): F {
  Object.defineProperty(fn, 'name', { value: name, writable: false })
  fn.displayName = name

  return fn
}
