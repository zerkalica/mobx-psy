export function psyObjectMerge<A extends {}, B extends {}>(a: A, b: B) {
  const result = { ...a, ...b }
  for (let k in a) {
    if (a[k] !== undefined && result[k] === undefined) result[k] = a[k] as any
  }

  return result
}
