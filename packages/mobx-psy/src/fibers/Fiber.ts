import { Refreshable, setRefreshable } from './Refreshable'
import { throwHidden } from '../utils'

export interface IFiberHost extends Refreshable {
  sync<V>(id: string, cb: (signal: AbortSignal) => PromiseLike<V>): V
  next(): void
  readonly signal: AbortSignal
}

/**
 * Caches value, while action / handler restarts.
 */
export class Fiber<V = any> implements Refreshable {
  protected actual: V | undefined = undefined
  protected catched: Error | PromiseLike<V> | undefined = undefined

  ;[Symbol.toStringTag]: string

  constructor(
    id: string,
    protected handler: (signal: AbortSignal) => PromiseLike<V>,
    protected host: IFiberHost
  ) {
    this[Symbol.toStringTag] = id
  }

  toString() {
    return this[Symbol.toStringTag]
  }

  /**
   * Set cached value
   *
   * @throws Error | Promise<V>
   */
  get(): V {
    if (this.catched) return throwHidden(this.catched)
    if (this.actual !== undefined) return this.actual
    const next = this.handler(this.host.signal)
    setRefreshable(next, this)
    this.catched = next
    next.then(this.success.bind(this), this.fail.bind(this))

    return throwHidden(this.catched)
  }

  protected success(actual: V) {
    if (this.host.signal.aborted) return
    this.actual = actual
    this.catched = undefined
    this.host.next()
  }

  protected fail(error: Error) {
    if (this.host.signal.aborted) return
    setRefreshable(error, this)
    this.catched = error
    this.host.next()
  }

  refresh() {
    this.host.refresh()
  }

  get initial() {
    return this.host.initial
  }
}
