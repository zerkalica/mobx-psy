import { isPromise } from '../utils/common'
import { Refreshable, setRefresh } from '../Refreshable'
import { throwHidden } from '../utils'

export interface IFiberHost {
  fiber<V>(id: FiberKey): Fiber<V>
}

export type FiberKey = string | number | symbol

/**
 * Caches value, while action / handler restarts.
 */
export class Fiber<V = any> {
  protected actual: V | undefined = undefined
  protected catched: Error | PromiseLike<V> | undefined = undefined

  static host: IFiberHost | undefined = undefined

  /**
   * Cell related cache. Used for converting async calls to sync.
   * Use inside mem values or mem.action methods.
   * For fetch use ``` fiberize ``` helper from this library.
   *
   * Low level @example:
   * ```ts
   * function fetchSyncJson(url: string, init?: RequestInit): R {
   *   return Fiber.get(`${(init && init.method) || 'GET'} ${url}`, abort => fetch(
   *     url,
   *     {...init as any, abort}
   *   ).then(r => r.json()))
   * }
   *
   * class Store {
   *   get todos(): Todo[] { return fetchSync('/todos') }
   * }
   * ```
   *
   * Fiberize @example:
   * ```ts
   * import {fiberize} from 'fiberize'
   * const fetchSyncJson = fiberize(fetch, r => r.json())
   * class Store {
   *   get todos(): Todo[] { return fetchSyncJson('/todos') }
   * }
   * ```
   */
  static get<V>(id: FiberKey, cb: (signal: AbortSignal) => PromiseLike<V>): V {
    const host = this.host
    if (!host) throw new Error('Run fiber inside fiber host')

    return host.fiber<V>(id).sync(cb)
  }

  constructor(
    protected readonly id: FiberKey,
    protected controller: Refreshable,
    /**
     * Signal to stop all pending operations, can be used in fetch(url, {abort: signal})
     */
    protected signal: AbortSignal
  ) {}

  toString() {
    return this.id
  }

  get pending(): boolean {
    return isPromise(this.catched)
  }

  get error(): Error | undefined {
    return this.catched instanceof Error ? this.catched : undefined
  }

  /**
   * Set cached value
   *
   * @throws Error | Promise<V>
   */
  sync(cb: (signal: AbortSignal) => PromiseLike<V>): V {
    if (this.actual !== undefined) return this.actual
    if (this.catched) return throwHidden(this.catched)
    const next = cb(this.signal)
    setRefresh(next, this)
    this.catched = next
    next.then(this.success.bind(this), this.fail.bind(this))

    return throwHidden(this.catched)
  }

  protected success(actual: V) {
    if (this.signal.aborted) return
    this.actual = actual
    this.catched = undefined
    this.controller.refresh()
  }

  protected fail(error: Error) {
    if (this.signal.aborted) return
    setRefresh(error, this)
    this.catched = error
    this.controller.refresh()
  }

  refresh() {
    this.catched = undefined
    this.controller.refresh()
  }
}
