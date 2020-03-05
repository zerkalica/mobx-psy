import { Fiber } from './Fiber'

export abstract class FiberHost {
  /**
   * Used for aborting all pended async operations in fibers on cell destruction.
   */
  protected abortController: AbortController | undefined = undefined

  /**
   * Fibers cache, live only when cell is pending or error.
   */
  protected fibers: Map<string, Fiber> | undefined = undefined

  ;[Symbol.toStringTag]: string

  static current: FiberHost | undefined = undefined

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

  get(id: string): Fiber | undefined {
    return this.fibers ? this.fibers.get(id) : undefined
  }

  set(id: string, fiber: Fiber) {
    if (!this.fibers) this.fibers = new Map()
    this.fibers.set(id, fiber)
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
