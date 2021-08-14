import { PsyErrorNotFound } from '@psy/psy/error/NotFound'

import { AcmeRouterSegMap } from './segMap'

type QueryOuter = Record<string, string | string[] | number | number[] | undefined>
type QueryInner = Record<string, string[] | undefined>

export class AcmeRouterCodecError extends PsyErrorNotFound {
  name = 'AcmeRouterCodecError'
}

function acmeRouteParamsToUrl(next: QueryOuter) {
  const params = new URLSearchParams()
  let hash = ''

  for (let key in next) {
    const value = next[key]
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const val of value) params.append(key, '' + val)
      continue
    }
    if (key === '#') hash = '' + value
    else params.set(key, '' + value)
  }

  const query = params.toString()
  const hashStr = hash ? `#${hash}` : ''
  const queryStr = query ? `?${query}` : ''

  return `${queryStr}${hashStr}`
}

type RegTag = (raw: TemplateStringsArray) => string

export type AcmeRouterCodecTag = (raw: TemplateStringsArray | string, cb?: (v: RegTag) => string) => string

type BuildFn<Key extends string> = (t: AcmeRouterCodecTag, src: Record<Key, AcmeRouterCodecTag>) => readonly string[]

function buildRegexpTpl(k: string, str: TemplateStringsArray | string, cb?: (v: RegTag) => string) {
  const [prefix, suffix = ''] = Array.isArray(str) ? str : [str, '']
  const mid = cb?.(r => `(?<${k}>${r[0]})`) ?? ''

  return `(?${mid ? ':' : `<${k}>`}${prefix}${mid}${suffix})`
}

function buildUrlTpl(
  this: Partial<Record<string, string | boolean>>,
  k: string,
  str: TemplateStringsArray | string,
  cb?: (v: RegTag) => string
) {
  const [prefix, suffix = ''] = Array.isArray(str) ? str : [str, '']
  const val = this[k]
  if (!val) return ''
  if (cb === undefined) return val === true ? prefix : val
  if (val === true) throw new Error(`Need a string: key ${k}, data: ${JSON.stringify(this)}`)

  const mid = cb(() => val)

  return `${prefix}${mid}${suffix}`
}

export type NullablePropertyOf<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never
}[keyof T]

export type NullablePartial<T> = Omit<T, NullablePropertyOf<T>> & Partial<Pick<T, NullablePropertyOf<T>>>

export class AcmeRouterCodec<Key extends string> {
  constructor(protected build: BuildFn<Key>) {
    const empty = {} as Record<Key, string | undefined>

    const o = new Proxy({} as Record<Key, AcmeRouterCodecTag>, {
      get(t, k) {
        empty[k as Key] = undefined
        return buildRegexpTpl.bind(null, k as string)
      },
    })

    this.regExp = new RegExp(build(r => (r instanceof AcmeRouterSegMap ? r.regExp : r[0]), o).join(''))
    this.empty = empty
    this[Symbol.toStringTag] = '' + this.regExp.source
    this.keys = Object.keys(empty) as Key[]
  }

  [Symbol.toStringTag]: string

  public keys: readonly Key[]

  protected emptySegments = this.buildSegments()
  protected empty: Record<Key, string | boolean | undefined>
  readonly regExp: RegExp

  initial() {
    return {
      seg: { ...this.empty },
      query: {} as QueryOuter,
    }
  }

  protected buildSegments(input: Partial<Record<Key, string | boolean>> = {}) {
    const o = new Proxy({} as Record<Key, AcmeRouterCodecTag>, {
      get(t, k) {
        return buildUrlTpl.bind(input, k as string)
      },
    })

    return this.build(() => '', o)
  }

  url({ seg, query }: { seg: Partial<Record<Key, string | boolean>>; query?: QueryOuter }) {
    const normalized = { ...query }
    for (const k in seg) normalized[k] = undefined

    const segParts = this.buildSegments(seg)

    let pathname = ''

    for (let i = 0; i < segParts.length; i++) {
      const part = segParts[i]
      if (this.emptySegments[i] === part) continue
      pathname += part
    }

    const q = acmeRouteParamsToUrl(normalized)

    return `${pathname || '/'}${q}`
  }

  match(url: string) {
    const [pathname, search] = url.split('?')
    const seg = (pathname.match(this.regExp)?.groups ?? undefined) as Record<Key, string | undefined> | undefined

    const query = {} as QueryInner

    if (seg !== undefined) {
      const params = new URLSearchParams(search)
      params.forEach((value, key) => {
        if (seg?.[key as Key] !== undefined) return
        let a = query[key]

        if (a === undefined) a = query[key] = []
        a.push(value)
      })
    }

    return { seg, query }
  }
}
