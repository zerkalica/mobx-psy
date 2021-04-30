export function accessThrow<V extends Object>(): V {
  return new Proxy({} as V, {
    get(t, key) {
      throw new Error('Implement context')
    },
    apply(t, thisVal, args) {
      throw new Error('Implement context')
    }
  })
}
