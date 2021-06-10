import { action, computed, makeObservable, observable, onBecomeUnobserved } from 'mobx'

import { PsyContext } from '../context/Context'
import { psyDataIsPromise } from '../data/isPromise'
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
    onBecomeUnobserved(this, 'value', this.destructor)
  }

  @computed protected get key() {
    return this.fetcher.hash(this.args())
  }

  @observable protected counter = 0
  protected cached: Result | Promise<unknown> | Error | undefined = undefined
  protected initial = true

  get isFirstRun() {
    return this.initial
  }

  @computed get value(): Result {
    // Subscribe to observable counter to recalucate all value deps, if Loader.next called
    this.counter

    let cached = this.cached
    if (cached === undefined) {
      cached = this.hydrator.get<Result>(this.key)
    }
    if (cached === undefined) {
      cached = this.fetch()
      psySyncRefreshable(cached, this)
      this.hydrator.prepare(this.key, cached)
      this.cached = cached
    }
    if (cached instanceof Error) return psyErrorThrowHidden(cached)
    if (psyDataIsPromise(cached)) return psyErrorThrowHidden(cached)

    return cached
  }

  protected ac = new AbortController()

  protected async fetch() {
    try {
      this.ac.abort()
      this.ac = new AbortController()
      const p = this.fetcher.get(this.args(), this.ac.signal) as Promise<Result>

      const next = await p

      this.hydrator.set(this.key, next)
      this.cached = next
      this.initial = false
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
    this.hydrator.remove(this.key)
    this.next()
  }

  @action.bound protected destructor() {
    this.hydrator.remove(this.key)
    this.ac.abort()
    this.initial = true
  }
}
