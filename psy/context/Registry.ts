type ReactLikeContext<V> = {
  _currentValue?: V
  $$typeof: Symbol
  Provider(p: { value: V; children: any }): unknown
}

type Cls<T> = (new (...args: any[]) => T) | (abstract new (...args: any[]) => T)

type PsyContextKey = Object | Function

export type PsyValue<Ctx = unknown> =
  Ctx extends ReactLikeContext<infer RealValue> ? RealValue
  : Ctx extends Cls<infer Instance> & { $$psy: boolean } ? Instance
  : Ctx extends Function ? Ctx
  : Ctx extends Object ? Ctx & { [Symbol.toStringTag]: string }
  : 'not a context value'

type PsyContext<V extends PsyContextKey = PsyContextKey> =
  | ReactLikeContext<V>
  | ( Cls<V> & { $$psy: boolean } )
  | V

export type PsyContextUpdater = (r: PsyContextRegistry) => unknown

export class PsyContextRegistry {
  protected state: Map<PsyContext, unknown> | undefined = undefined

  constructor(protected parent?: PsyContextRegistry) {}

  static root = new PsyContextRegistry()

  clone(cb: PsyContextUpdater) {
    const next = new PsyContextRegistry(this)

    cb(next)

    return next.changed ? next : this
  }

  protected changed = false

  set<V extends PsyContextKey>(p: PsyContext<V>, v: V) {
    if (v === null) throw new Error(`null value not allowed for ${p}`)

    const prev = this.parent?.opt<V>(p)
    if (prev === v) return this

    if (this.state === undefined) {
      this.state = this.parent?.state === undefined ? new Map() : new Map(this.parent.state)
    }
    this.state.set(p, v)
    this.changed = true

    return this
  }

  v<V>(p: PsyContext<V>) {
    const dep = this.opt(p)
    if (dep === undefined) throw new Error(`Provide value for ${p}`)

    return dep
  }

  opt<V>(p: PsyContext<V>) {
    if (this.state === undefined && this.parent?.state !== undefined) this.state = new Map(this.parent.state)
    const dep = this.state?.get(p) as V | undefined
    if (dep !== undefined) return dep

    if (isReactContext<V>(p)) return p._currentValue
    if ((p as {$$psy?: boolean}).$$psy === true) return undefined

    return p as V
  }
}

function isReactContext<V>(v: any): v is ReactLikeContext<V> {
  return typeof v === 'object' && typeof v.$$typeof === 'symbol' && typeof v.Provider === 'function'
}
