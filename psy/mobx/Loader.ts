import { action, computed, makeObservable, observable } from 'mobx'

import { FiberHost } from '@psy/core'
import { effect } from './effect'
import { getDerivableName } from './getDerivableName'

/**
 * Suspendable calculations
 * 
 * @throws Error | PromiseLike<V>
 */
export type LoaderHandler<V> = () => V

/**
 * Run, restart and cache suspendable calculations in the handler.
 */
export class Loader<V> extends FiberHost {
  @observable protected counter = 0
  protected initial = true

  constructor(
    protected handler: LoaderHandler<V>,

    /**
     * Called after Loader.value become unobserved
     */
    protected dispose: () => void
  ) {
    super('Loader#' + getDerivableName())
    makeObservable(this)
    effect(this, 'value', () => this.destructor.bind(this))
  }

  get isFirstRun() {
    return this.initial
  }

  /**
   * Observable value
   *
   * @throws Error | PromiseLike<V> 
   */
  @computed get value(): V {
    // Subscribe to observable counter to recalucate all value deps, if Loader.next called
    this.counter
    const prev = FiberHost.current

    // Expose themself to handler fibers
    FiberHost.current = this

    try {
      const next = this.handler()
      this.clear()
      this.initial = false

      return next
    } finally {
      FiberHost.current = prev
    }
  }

  @action next() {
    this.counter++
  }

  /**
   * Called on Loader.value become unobserved
   */
  destructor() {
    this.clear()
    this.initial = true
    this.dispose()
  }
}
