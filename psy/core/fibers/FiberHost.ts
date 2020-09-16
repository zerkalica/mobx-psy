import { Fiber } from './Fiber'
import { Refreshable } from './Refreshable';

/**
 * Caches and control all fibers in calculations.
 * Keeps each suspendable calculation cache, while calculations are in progress.
 */
export abstract class FiberHost implements Refreshable {
  /**
   * Used for aborting all pended async operations in fibers on cell destruction.
   */
  protected abortController: AbortController | undefined = undefined

  /**
   * Fibers cache, live only when cell is pending or error.
   */
  protected fibers: Map<string, Fiber> | undefined = undefined

  ;[Symbol.toStringTag]: string

  /**
   * FiberHost writes self to this variable before each calculation.
   * Fibers in calculations used fiberhost as cache, while calculations rerunning.
   */
  static current: FiberHost | undefined = undefined

  constructor(id: string) {
    this[Symbol.toStringTag] = id
  }

  toString() {
    return this[Symbol.toStringTag]
  }

  /**
   * Fiber queue size
   */
  get size() {
    return this.fibers ? this.fibers.size : 0
  }

  /**
   * Abort signal to pass to fetch
   */
  get signal() {
    if (!this.abortController) this.abortController = new AbortController()
    return this.abortController.signal
  }

  /**
   * Get fiber by id,
   * @param id async operation id, for example: url+query
   */
  get(id: string): Fiber | undefined {
    return this.fibers ? this.fibers.get(id) : undefined
  }

  /**
   * Set fiber to id
   * @param id async operation id, for example: url+query
   */
  set(id: string, fiber: Fiber) {
    if (!this.fibers) this.fibers = new Map()
    this.fibers.set(id, fiber)
  }

  abstract get isFirstRun(): boolean

  /**
   * Used internally to continue calculation after any async operation inside fiber resolves or rejects
   */
  abstract next(): void

  refresh() {
    this.clear()
    this.next()
  }

  /**
   * Clear non-reactive fiber host state.
   */
  protected clear() {
    if (this.abortController) this.abortController.abort()
    this.abortController = undefined
    if (this.fibers) this.fibers.clear()
    this.fibers = undefined
  }
}
