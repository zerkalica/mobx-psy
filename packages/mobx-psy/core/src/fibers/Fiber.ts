import { Refreshable, setRefreshable } from './Refreshable'
import { isPromise, throwHidden, normalizeError } from '../utils'
import { FiberHost } from './FiberHost'

export class FiberHostNotFound extends Error {
  name = 'FiberHostNotFound'

  constructor(message = `Run fiber inside fiber host: use @sync`) {
    super(message)
  }
}

/**
 * Caches value, while handler restarts.
 */
export class Fiber<V = any> implements Refreshable {
  /**
   * Cached fiber value
   */
  protected actual: V | undefined = undefined

  /**
   * Catched error or promise
   */
  protected catched: Error | PromiseLike<V> | undefined = undefined

  ;[Symbol.toStringTag]: string

  protected host: FiberHost

  constructor(
    id: string,
    /**
     * Suspendable calculations
     *
     * @throws Error | PromiseLike<V>
     */
    protected handler: (signal: AbortSignal) => V
  ) {
    const host = FiberHost.current

    if (!host) throw new FiberHostNotFound()

    this.host = host
    this[Symbol.toStringTag] = id
    host.set(id, this)
  }

  static get<V>(id: string): Fiber<V> | undefined {
    const host = FiberHost.current

    if (!host) throw new FiberHostNotFound()

    return host.get(id)
  }

  toString() {
    return this[Symbol.toStringTag]
  }

  /**
   * Calculate or get cached fiber value
   *
   * @throws Error | Promise<V>
   */
  get(): V {
    if (this.catched) return throwHidden(this.catched)
    if (this.actual !== undefined) return this.actual

    try {
      this.actual = this.handler(this.host.signal)

      return this.actual
    } catch (e) {
      const error = normalizeError(e);
      setRefreshable(error, this)
      this.catched = error

      if (isPromise(error))
        error.then(this.success.bind(this), this.fail.bind(this))

        return throwHidden(error)
    }
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

  get isFirstRun() {
    return this.host.isFirstRun
  }
}
