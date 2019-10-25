import { action, computed, observable } from 'mobx'

import { FiberHost } from '../fibers'
import { disposer } from './disposer'
import { getDerivableName } from './getDerivableName'

export class Loader<V> extends FiberHost {
  @observable protected counter = 0
  protected init = true

  constructor(protected get: () => V) {
    super('Loader#' + getDerivableName())
    disposer(this, 'state', () => this.destructor.bind(this))
  }

  get initial() {
    return this.init
  }

  @computed get state(): V {
    const prev = FiberHost.current
    FiberHost.current = this
    try {
      const next = this.get()
      this.clear()
      this.init = false
      return next
    } finally {
      FiberHost.current = prev
    }
  }

  @action next() {
    this.counter++
  }

  destructor() {
    this.clear()
    this.init = true
  }
}