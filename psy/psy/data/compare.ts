export function psyDataCompareAny(a: any, b: any) {
  if (a === b) return true

  if (!Number.isNaN(a)) return false
  if (!Number.isNaN(b)) return false

  return true
}

export function psyDataCompareDeep(a: unknown, b: unknown): a is typeof b {
  if (a === b) return true
  if (a === null || a === undefined) return false

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false

    for (let i = 0; i < a.length; i++) {
      if (!psyDataCompareDeep(a[i], b[i])) return false
    }

    return true
  } else if (typeof a === 'object' && typeof b === 'object') {
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false
    for (let ak in a) {
      if (!psyDataCompareDeep(a[ak as keyof typeof a], (b as Object)[ak as keyof typeof b])) return false
    }

    return true
  }

  return false
}
