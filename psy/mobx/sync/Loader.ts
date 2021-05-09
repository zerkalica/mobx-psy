import { action, computed, makeObservable, observable, onBecomeUnobserved } from 'mobx'

import { PsyContext } from '@psy/core/context/Context'
import { psyDataIsPromise } from '@psy/core/data/isPromise'
import { psyErrorThrowHidden } from '@psy/core/error/hidden'
import { PsyFetcher, PsyFetcherProps } from '@psy/core/fetcher/Fetcher'
import { PsySsrHydrator } from '@psy/core/ssr/Hydrator'

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
export class PsySyncLoader<Result> {
  constructor(
    protected $: PsyContext,
    protected args: PsyFetcherProps,
    protected fetcher = $.v(PsyFetcher),
    protected hydrator = $.v(PsySsrHydrator.instance)
  ) {
    makeObservable(this)
    onBecomeUnobserved(this, 'value', this.destructor.bind(this))
  }

  protected key = this.fetcher.hash(this.args)

  @observable protected counter = 0
  protected raw: Result | Promise<Result> | Error | undefined = undefined
  public initial = true

  @computed get value(): Result {
    // Subscribe to observable counter to recalucate all value deps, if Loader.next called
    this.counter

    const raw = this.raw ?? this.hydrator.get<Result>(this.key)

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
      const err = e instanceof Error ? e : new Error(e)
      if (err !== e) (err as Error & { original: Error }).original = e
      this.hydrator.set(this.key, err)
      this.raw = err
      this.next()

      return psyErrorThrowHidden(err)
    }
  }

  @action next() {
    this.counter++
  }

  reload() {
    this.hydrator.remove(this.key)
    this.next()
  }

  protected destructor() {
    this.hydrator.remove(this.key)
    this.ac.abort()
    this.initial = true
  }
}
