import { Fiber, IFiberHost } from './Fiber'

export abstract class FiberHost implements IFiberHost {
  static current: IFiberHost | undefined = undefined

  static sync<V>(id: string, handler: (signal: AbortSignal) => PromiseLike<V>): V {
    const host = FiberHost.current
    if (!host) throw new Error(`Run fiber ${id} inside fiber host`)
  
    return host.sync<V>(id, handler)
  }

  /**
   * Used for aborting all pended async operations in fibers on cell destruction.
   */
  protected abortController: AbortController | undefined = undefined

  /**
   * Fibers cache, live only when cell is pending or error.
   */
  protected fibers: Map<string, Fiber> | undefined = undefined

  ;[Symbol.toStringTag]: string

  constructor(id: string) {
    this[Symbol.toStringTag] = id
  }

  toString() {
    return this[Symbol.toStringTag]
  }

  get size() {
    return this.fibers ? this.fibers.size : 0
  }

  get signal() {
    if (!this.abortController) this.abortController = new AbortController()
    return this.abortController.signal
  }

  /**
   * Creates or returns cached fiber.
   * Key is unique in cell scope.
   *
   * @param id Unique cache lookup key
   */
  sync<V>(id: string, cb: (signal: AbortSignal) => PromiseLike<V>): V {
    if (!this.fibers) this.fibers = new Map()
    const fibers = this.fibers

    let fiber: Fiber<V> | undefined = fibers.get(id)
    if (!fiber) {
      fiber = new Fiber(id, cb, this)
      fibers.set(id, fiber)
    }

    return fiber.get()
  }

  abstract get initial(): boolean
  abstract next(): void

  refresh() {
    this.clear()
    this.next()
  }

  protected clear() {
    if (this.abortController) this.abortController.abort()
    this.abortController = undefined
    if (this.fibers) this.fibers.clear()
    this.fibers = undefined
  }
}
