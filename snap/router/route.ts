import { computed, makeObservable } from 'mobx'

import { SnapRouterParamMapper, SnapRouterSerializer } from './serializer'

export interface SnapRouterParams {
  get(key: string): string | undefined
  set(key: string, value: any): void
}

class SnapRouterParamsMock implements SnapRouterParams {
  get(key: string): string | undefined {
    return undefined
  }
  set(key: string, value: any): void {}
}

export type Setters<O extends {}> = { [P in keyof O]: (next: O[P]) => void }

export type Primitive = any // string | boolean | number
export type DefaultParams = {
  [id: string]: Primitive | Primitive[] | Set<Primitive>
}

export class SnapRouterRoute<O extends DefaultParams, K extends keyof O = keyof O> {
  protected serializer: SnapRouterSerializer<O>
  readonly values: O

  constructor(
    protected defaults: O,
    protected mapper?: SnapRouterParamMapper<O>,
    protected deleteDefault = true,
    protected query: SnapRouterParams = new SnapRouterParamsMock()
  ) {
    makeObservable(this)
    this.serializer = new SnapRouterSerializer(defaults, mapper)
    const values = (this.values = {} as O)
    const keys = Object.keys(defaults)
    for (let key of keys) {
      Object.defineProperty(values, key, {
        enumerable: true,
        get: this.getValue.bind(this, key as K),
        set: this.setValue.bind(this, key as K),
      })
    }
  }

  location(query: SnapRouterParams): SnapRouterRoute<O> {
    return new SnapRouterRoute(this.defaults, this.mapper, this.deleteDefault, query)
  }

  protected getValue(key: K): O[K] {
    const value = this.serializer.deserialize(key, this.query.get(key as string))
    return value
  }

  protected setValue(key: K, value: O[K]) {
    const next = this.deleteDefault && value === this.defaults[key] ? undefined : this.serializer.serialize(key, value)

    this.query.set(key as string, next)

    return true
  }

  @computed get changed() {
    const { defaults } = this
    let changed = false
    for (let key in defaults) {
      if (defaults[key as keyof O] !== this.getValue(key as unknown as K)) changed = true
    }

    return changed
  }

  update(next?: Partial<O>) {
    if (!next) {
      for (let key in this.defaults) this.query.set(key, undefined)
      return
    }

    for (let name in next) {
      this.setValue(name as unknown as K, next[name] as O[K])
    }
  }
}
