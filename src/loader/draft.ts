import { observable } from 'mobx'

export function draft<O extends {}>(orig: O): O {
  return new Draft(orig).values
}

class Draft<O extends {}, K extends keyof O = keyof O> {
  constructor(protected original: O) {
    Object.keys(original)
  }

  @observable protected draft = new Map<keyof O, O[K]>()

  protected getValue(target: O, name: K): O[K] {
    if (this.draft.has(name)) return this.draft.get(name) as O[K]
    return this.original[name]
  }

  protected setValue(target: O, name: K, value: O[K]) {
    if (this.original[name] === value) this.draft.delete(name)
    else this.draft.set(name, value)
    return true
  }

  readonly values: O = new Proxy(this.original, {
    get: this.getValue.bind(this),
    set: this.setValue.bind(this),
  })

  get changed() {
    return this.draft.size > 0
  }
}
