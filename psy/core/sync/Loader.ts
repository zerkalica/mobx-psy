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
    protected args: PsyFetcherProps,
    protected fetcher = $.get(PsyFetcher),
    protected hydrator = $.get(PsySsrHydrator.instance)
  ) {
    makeObservable(this)
    onBecomeUnobserved(this, 'value', this.destructor.bind(this))
  }

  protected key = this.fetcher.hash(this.args)

  @observable protected counter = 0
  protected raw: Result | Promise<Result> | Error | undefined = undefined
  protected initial = true

  get isFirstRun() {
    return this.initial
  }

  @computed get value(): Result {
    // Subscribe to observable counter to recalucate all value deps, if Loader.next called
    this.counter

    let raw = this.raw
    if (raw === undefined) raw = this.hydrator.get<Result>(this.key)

    if (raw instanceof Error || psyDataIsPromise(raw)) return psyErrorThrowHidden(raw)
    if (raw === undefined) {
      const p = this.fetch()
      this.hydrator.prepare(this.key, p)
      return psyErrorThrowHidden(p)
    }

    return raw
  }

  protected ac = new AbortController()

  protected async fetch() {
    this.ac = new AbortController()
    const p = this.fetcher.get(this.args, this.ac.signal) as Promise<Result>
    this.raw = p

    try {
      const raw = await p
      this.hydrator.set(this.key, raw)
      this.raw = raw
      this.initial = false
      this.next()

      return raw
    } catch (e) {
      const err = psyErrorNormalize(e) as Error
      psySyncRefreshable(e, this)
      this.hydrator.set(this.key, err)
      this.raw = err
      this.next()

      return psyErrorThrowHidden(err)
    }
  }

  @action next() {
    this.counter++
  }

  refresh() {
    this.hydrator.remove(this.key)
    this.next()
  }

  protected destructor() {
    this.hydrator.remove(this.key)
    this.ac.abort()
    this.initial = true
  }
}
