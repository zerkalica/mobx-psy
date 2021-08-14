type ReactLikeContext<V> = {
  _currentValue?: V
  $$typeof: Symbol
  Provider(p: { value: V; children: any }): unknown
}

type PsyContextValue = Object | Function

type PsyContextKey<V extends PsyContextValue = PsyContextValue> = ReactLikeContext<V> | V

export type PsyContextUpdater = (r: PsyContext) => PsyContext

export class PsyContext {
  protected registry: Map<PsyContextKey, unknown> | undefined = undefined

  constructor(protected parent?: PsyContext) {}

  clone(cb: PsyContextUpdater) {
    const next = new PsyContext(this)

    cb(next)

    return next.changed ? next : this
  }

  protected changed = false

  set<V extends PsyContextValue>(p: PsyContextKey<V>, v: V) {
    if (v === null) throw new Error(`null value not allowed for ${p}`)

    const prev = this.parent?.opt<V>(p)
    if (prev === v) return this

    if (this.registry === undefined) {
      this.registry = this.parent?.registry === undefined ? new Map() : new Map(this.parent.registry)
    }
    this.registry.set(p, v)
    this.changed = true

    return this
  }

  get<V>(p: PsyContextKey<V>) {
    const dep = this.opt(p)
    if (dep === undefined) throw new Error(`PsyContext, provide value for ${p}`)

    return dep
  }

  opt<V>(p: PsyContextKey<V>) {
    if (this.registry === undefined && this.parent?.registry !== undefined) this.registry = new Map(this.parent.registry)
    const dep = this.registry?.get(p) as V | undefined
    if (dep !== undefined) return dep

    if (isReactContext<V>(p)) return p._currentValue

    return p
  }

  static instance = new PsyContext()
}

function isReactContext<V>(v: any): v is ReactLikeContext<V> {
  return typeof v === 'object' && typeof v.$$typeof === 'symbol' && typeof v.Provider === 'function'
}
