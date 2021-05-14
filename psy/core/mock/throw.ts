export function psyMockThrow<V>(v: (Object | Function) & { [Symbol.toStringTag]?: string }): V {
  return new Proxy(v as V & { [Symbol.toStringTag]: string }, {
    get(t, key) {
      if (key === 'toString') return t[key].bind(t)
      if (key === Symbol.toStringTag) return t[Symbol.toStringTag]

      throw new Error(`psyMockThrow, provide value for object ${t}.${key.toString()}`)
    },
    apply(t, thisVal, args) {
      throw new Error(`psyMockThrow, Provide value for function ${t}.${thisVal}`)
    },
  })
}
