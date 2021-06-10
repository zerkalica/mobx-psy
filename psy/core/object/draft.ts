import { action, makeObservable, observable, reaction } from 'mobx'

import { psySyncEffect } from '../sync/effect'

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
 * const copy = new Draft(original).values
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
export class PsyObjectDraft<O extends {}> {
  constructor(protected original: O, protected push: (values: O) => void, reactionOptions?: Parameters<typeof reaction>[2]) {
    makeObservable(this)
    psySyncEffect(this, 'values', () => this.values, this.submit, reactionOptions)
  }

  @observable.struct values = { ...this.original }

  @action.bound submit() {
    this.push(this.values)
  }
}
