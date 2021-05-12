import { makeObservable, observable } from 'mobx'

/**
 * Create an observable mutable proxy of immutable object.
 * Each property is observable.
 *
 * ```ts
 * class A {
 *   @observable a = '123'
 * }
 *
 * const original = new A
 * const copy = draft(original)
 *
 * autorun(() => {
 *   console.log(copy, 'changed')
 * })
 *
 * copy.a = '321' // changed
 * original.a === '123'
 *
 * if (copy.changed) {
 *   Object.assign(original, draft)
 * }
 * ```
 */
export function psyObjectDraft<O extends {}>(orig: O): O {
  return new PsyObjectDraft(orig).values
}

class PsyObjectDraft<O extends {}, K extends keyof O = keyof O> {
  readonly values: O

  constructor(protected original: O) {
    makeObservable(this)
    const values = (this.values = {} as O)
    const keys = Object.keys(original)
    for (let key of keys) {
      // subscribe to original changes
      original[key as K]
      Object.defineProperty(values, key, {
        enumerable: true,
        get: this.getValue.bind(this, key as K),
        set: this.setValue.bind(this, key as K),
      })
    }
  }

  @observable protected draft = new Map<keyof O, O[K]>()

  protected getValue(name: K): O[K] {
    if (this.draft.has(name)) return this.draft.get(name) as O[K]
    return this.original[name]
  }

  protected setValue(name: K, value: O[K]) {
    if (this.original[name] === value) this.draft.delete(name)
    else this.draft.set(name, value)
    return true
  }

  get changed() {
    return this.draft.size > 0
  }
}
