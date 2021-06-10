import { action, computed, makeObservable, observable, onBecomeUnobserved } from 'mobx'

import { PsyContext } from '../context/Context'
import { psyErrorThrowHidden } from '../error/hidden'
import { psyErrorNormalize } from '../error/normalize'
import { PsyFetcher, PsyFetcherProps } from '../fetcher/Fetcher'
import { PsySsrHydrator } from '../ssr/Hydrator'
import { PsySyncRefreshable, psySyncRefreshable } from './refreshable'

/**
 * ```ts
 * class F {
 *   @computed get loader() { return new Loader(this.$, this.filters) }
 *   user() {
 *     return this.loader.value
 *   }
 * }
 * ```
 */
export class PsySyncLoader<Result> implements PsySyncRefreshable {
  constructor(
    protected $: PsyContext,
    protected args: () => PsyFetcherProps,
    protected fetcher = $.get(PsyFetcher),
    protected hydrator = $.get(PsySsrHydrator.instance)
  ) {
    makeObservable(this)
    onBecomeUnobserved(this, 'counter', this.destructor.bind(this))
  }

  @computed protected get key() {
    const args = this.args()

    // Need refetch if args changed while loading
    this.cached = undefined

    return args.kind + '.' + JSON.stringify(args.params)
  }

  @observable protected counter = 0

  protected cached: Result | Promise<unknown> | Error | undefined = undefined

  get isFirstRun() {
    return this.cached === undefined
  }

  get value() {
    // Subscribe to observable counter to recalucate all value deps, if Loader.next called
    this.counter
    // Subsribe to args to refetch, recalculate if args changed
    const key = this.key

    let cached = this.cached

    if (cached === undefined) cached = this.hydrator.get<Result>(key)
    if (cached === undefined) {
      cached = this.fetch()
      psySyncRefreshable(cached, this)
      this.hydrator.prepare(key, cached)
      this.cached = cached
    }

    if (cached instanceof Error || cached instanceof Promise) return psyErrorThrowHidden(cached)

    return cached
  }

  protected ac = new AbortController()

  protected async fetch() {
    try {
      this.ac.abort()
      this.ac = new AbortController()
      const p = this.fetcher.get(this.args(), this.ac.signal) as Promise<Result>

      const next = await p
      if (next === undefined) throw new Error(`Change undefined to null in response of ${this}`)

      this.hydrator.set(this.key, next)
      this.cached = next
      this.next()
    } catch (e) {
      const err = psyErrorNormalize(e) as Error
      psySyncRefreshable(err, this)
      this.hydrator.error(this.key, err)
      this.cached = err
      this.next()
    }
  }

  @action protected next() {
    this.counter++
  }

  @action.bound refresh() {
    this.cached = undefined
    this.next()
  }

  protected destructor() {
    this.ac.abort()
    this.cached = undefined
  }
}
