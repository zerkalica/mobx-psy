import { ParamMapper, Serializer } from './Serializer'
import { computed } from 'mobx'

export interface ParamsQuery {
  get(key: string): string | undefined
  set(key: string, value: any): void
}

class ParamsQueryMock implements ParamsQuery {
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

export class Route<O extends DefaultParams, K extends keyof O = keyof O> {
  protected serializer: Serializer<O>

  constructor(
    protected defaults: O,
    protected mapper?: ParamMapper<O>,
    protected deleteDefault = true,
    protected query: ParamsQuery = new ParamsQueryMock()
  ) {
    this.serializer = new Serializer(defaults, mapper)
  }

  location(query: ParamsQuery): Route<O> {
    return new Route(this.defaults, this.mapper, this.deleteDefault, query)
  }

  protected getValue(target: O, key: K): O[K] {
    const value = this.serializer.deserialize(
      key,
      this.query.get(key as string)
    )
    return value
  }

  protected setValue(target: O, key: K, value: O[K]) {
    const next =
      this.deleteDefault && value === this.defaults[key]
        ? undefined
        : this.serializer.serialize(key, value)

    this.query.set(key as string, next)

    return true
  }

  readonly values: O = new Proxy(this.defaults, {
    get: this.getValue.bind(this),
    set: this.setValue.bind(this),
  })

  @computed get changed() {
    const { defaults } = this
    let changed = false
    for (let key in defaults) {
      if (
        defaults[key as keyof O] !==
        this.getValue(defaults, (key as unknown) as K)
      )
        changed = true
    }

    return changed
  }

  update(next?: Partial<O>) {
    if (!next) {
      for (let key in this.defaults) this.query.set(key, undefined)
      return
    }

    for (let name in next) {
      this.setValue(this.defaults, (name as unknown) as K, next[name] as O[K])
    }
  }
}
