import { action, computed, makeObservable, observable, onBecomeUnobserved } from 'mobx'

import { PsyContext } from '../context/Context'
import { psyErrorThrowHidden } from '../error/hidden'
import { psyErrorNormalize } from '../error/normalize'
import { PsyFetcher, PsyFetcherProps } from '../fetcher/Fetcher'
import { PsyLog } from '../log/log'
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
export class PsySyncLoader<Result, Args extends PsyFetcherProps = PsyFetcherProps> implements PsySyncRefreshable {
  constructor(
    protected $: PsyContext,
    protected args: () => Args,
    protected fetcher = $.get(PsyFetcher),
    protected hydrator = $.get(PsySsrHydrator.instance)
  ) {
    makeObservable(this)
    onBecomeUnobserved(this, 'counter', this.destructor)
  }

  @computed protected get key() {
    const args = this.args()

    // Need refetch if args changed while loading
    this.cached = undefined

    return args.kind + '.' + JSON.stringify(args.params)
  }

  @observable protected counter = 0

  get loading() {
    this.counter

    return this.cached instanceof Promise
  }

  get error() {
    this.counter

    return this.cached instanceof Error ? this.cached : undefined
  }

  protected actual: Result | undefined = undefined
  protected cached: Result | Promise<unknown> | Error | undefined = undefined

  get value() {
    this.counter
    // Subsribe to args to refetch, recalculate if args changed
    const key = this.key
    let cached = this.cached

    if (cached === undefined) cached = this.hydrator.get<Result>(key)
    if (cached === undefined) cached = this.refresh()

    if (this.actual !== undefined) return this.actual

    if (cached instanceof Error) return psyErrorThrowHidden(cached)
    if (cached instanceof Promise) return psyErrorThrowHidden(cached)

    this.actual = cached

    return cached
  }

  protected ac = new AbortController()

  @action.bound refresh() {
    const next = this.counter + 1
    const cached = this.refreshAsync(next)
    psySyncRefreshable(cached, this)
    this.hydrator.prepare(this.key, cached)
    this.cached = cached
    this.counter = next

    return cached
  }

  protected async refreshAsync(counter: number) {
    try {
      this.ac.abort()
      this.ac = new AbortController()
      const next = await this.fetch(this.args(), this.ac.signal)
      this.success(next, counter)
    } catch (e) {
      this.fail(e, counter)
    }
  }

  protected fetch(args: Args, signal: AbortSignal) {
    return this.fetcher.get(args, signal) as Promise<Result>
  }

  @action protected fail(e: unknown, counter: number) {
    const err = psyErrorNormalize(e)
    psySyncRefreshable(err, this)
    this.hydrator.error(this.key, err)
    if (counter !== this.counter) return this.warnAbortSignal()

    this.cached = err
    this.counter++
  }

  @action protected success(next: Result, counter: number) {
    if (next === undefined) throw new Error(`Change undefined to null in response of ${this}`)
    this.hydrator.set(this.key, next)
    if (counter !== this.counter) return this.warnAbortSignal()

    this.cached = next
    this.actual = next
    this.counter++
  }

  protected warnAbortSignal() {
    const error = new Error(`Probably AbortSignal not handled in previous fetch call, ${this}`)
    this.$.get(PsyLog).warn({ place: 'PsySyncLoader', message: error })
  }

  @action.bound protected destructor() {
    this.ac.abort()
    this.cached = undefined
    this.actual = undefined
  }
}
