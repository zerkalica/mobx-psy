import { Refreshable } from '../Refreshable'
import { Fiber, FiberKey, IFiberHost } from './Fiber'

export class FiberHost implements IFiberHost {
  /**
   * Used for aborting all pended async operations in fibers on cell destruction.
   */
  protected abortController = new AbortController()

  /**
   * Fibers cache, live only when cell is pending or error.
   */
  protected fibers = new Map<any, Fiber>()

  constructor(protected controller: Refreshable) {}

  toString() {
    return `${String(this.controller)}.fibers`
  }

  get size() {
    return this.fibers.size
  }

  /**
   * Creates or returns cached fiber.
   * Key is unique in cell scope.
   *
   * @param key Unique cache lookup key
   */
  fiber<V>(key: FiberKey): Fiber<V> {
    const fibers = this.fibers

    let fiber: Fiber<V> | undefined = fibers.get(key)
    if (!fiber) {
      fiber = new Fiber(key, this.controller, this.abortController.signal)
      fibers.set(key, fiber)
    }

    return fiber
  }

  destructor() {
    this.abortController.abort()
    this.fibers.clear()
  }
}
