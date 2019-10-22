export interface ParamCodec<O extends {} = {}, P = string, V = any> {
  serialize?: (value: V) => string
  deserialize?: (value: string) => V
}

export type ParamMapper<O> = Partial<{ [P in keyof O]: ParamCodec<O, P, O[P]> }>

export const defaultCodecs = [
  {
    detect: (value: any): value is string => typeof value === 'string',
    serialize: (value: string) => value,
    deserialize: (value: string) => value,
  },
  {
    detect: (value: any): value is boolean => typeof value === 'boolean',
    serialize: (value: boolean) => (value ? '1' : '0'),
    deserialize: (value: string) => value === '1',
  },
  {
    detect: (value: any): value is number => typeof value === 'number',
    serialize: (value: number) => String(value),
    deserialize: (value: string) => Number(value),
  },
  {
    detect: (value: any): value is string[] => value instanceof Array,
    serialize: (value: string[]) => value.join(','),
    deserialize: (value: string) => value.split(','),
  },
  {
    detect: (value: any): value is number[] =>
      value instanceof Array &&
      value.length > 0 &&
      typeof value[0] === 'number',
    serialize: (value: number[]) => value.join(','),
    deserialize: (value: string) => value.split(',').map(Number),
  },
]

function equalArray<T>(next: T[], prev: T[]): boolean {
  if (next === prev) return true
  if (!next && prev) return false
  if (!prev && next) return false
  if (next.length !== prev.length) return false
  for (let i = 0; i < next.length; i++) if (next[i] !== prev[i]) return false
  return true
}

function equalSet<T>(next: Set<T>, prev: Set<T>): boolean {
  if (next === prev) return true
  if (!next && prev) return false
  if (!prev && next) return false
  if (next.size !== prev.size) return false
  let result = true
  next.forEach(item => {
    if (!prev.has(item)) result = false
  })
  return result
}

export class Serializer<O> {
  constructor(
    protected defaults: O,
    protected mapper?: ParamMapper<O>,
    protected codecs = defaultCodecs
  ) {}

  protected cache = new Map<keyof O, any>()

  deserialize<T extends keyof O>(key: T, rawValue?: string): O[T] {
    const { defaults, mapper } = this
    const defaultValue = defaults[key]
    const keyMap = mapper && mapper[key]
    if (rawValue === undefined) return defaultValue

    let next: O[T] | undefined
    if (keyMap && keyMap.deserialize) next = keyMap.deserialize(rawValue)
    else
      for (let codec of this.codecs) {
        if (codec.detect(defaultValue)) {
          next = (codec.deserialize(rawValue) as unknown) as O[T]
          break
        }
      }

    if (next === undefined)
      throw new Error(`Codec not found for { ${key}: ${defaultValue} }`)

    if (next instanceof Array) {
      if (defaultValue instanceof Array && equalArray(next, defaultValue))
        return defaultValue
      const cached = this.cache.get(key)
      if (equalArray(next, cached)) return cached
      this.cache.set(key, next)
    }

    if (next instanceof Set) {
      if (defaultValue instanceof Set && equalSet(next, defaultValue))
        return defaultValue
      const cached = this.cache.get(key)
      if (equalSet(next, cached)) return cached
      this.cache.set(key, next)
    }

    return next
  }

  serialize<T extends keyof O>(key: T, value: O[T]): string {
    const { defaults, mapper } = this
    const defaultValue = defaults[key]
    const keyMap = mapper && mapper[key]

    if (keyMap && keyMap.serialize) return keyMap.serialize(value)

    for (let codec of this.codecs) {
      if (codec.detect(defaultValue)) return codec.serialize(value as never)
    }
    throw new Error(`Codec not found for { ${key}: ${defaultValue} }`)
  }
}
