import { action, computed, makeObservable, observable, onBecomeUnobserved } from 'mobx'

import { PsyContext } from '../context/Context'
import { psyErrorThrowHidden } from '../error/hidden'
import { psyErrorNormalize } from '../error/normalize'
import { PsyFetcher, PsyFetcherProps } from '../fetcher/Fetcher'
import { PsyLog } from '../log/log'
import { PsySsrHydrator } from '../ssr/Hydrator'
import { PsySyncRefreshable, psySyncRefreshable } from './refreshable'

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

  protected actual: Result | undefined = undefined

  get loading() {
    return this.pulled instanceof Promise
  }

  get initial() {
    return this.actual === undefined && this.pulled instanceof Promise
  }

  get error() {
    const value = this.pulled
    return value instanceof Error ? value : undefined
  }

  get value() {
    const value = this.pulled

    if (this.actual !== undefined) return this.actual
    if (value instanceof Error || value instanceof Promise) return psyErrorThrowHidden(value)

    this.actual = value

    return value
  }

  protected cached: Result | Promise<unknown> | Error | undefined = undefined

  @computed protected get pulled() {
    this.counter
    // Subsribe to args to refetch, recalculate if args changed
    const key = this.key
    let cached = this.cached

    if (cached === undefined) cached = this.hydrator.get<Result>(key)
    if (cached === undefined) cached = this.refresh()

    return cached
  }

  protected ac = new AbortController()

  @action.bound refresh() {
    const cached = this.refreshAsync()
    psySyncRefreshable(cached, this)
    this.hydrator.prepare(this.key, cached)
    this.cached = cached
    this.counter++

    return cached
  }

  protected async refreshAsync() {
    this.ac.abort()
    this.ac = new AbortController()
    const signal = this.ac.signal

    try {
      const next = await this.fetch(this.args(), signal)
      this.success(next, signal)
    } catch (e) {
      this.fail(e, signal)
    }
  }

  protected fetch(args: Args, signal: AbortSignal) {
    return this.fetcher.get(args, signal) as Promise<Result>
  }

  @action protected fail(e: unknown, signal: AbortSignal) {
    const err = psyErrorNormalize(e)
    psySyncRefreshable(err, this)
    this.hydrator.error(this.key, err)
    if (signal.aborted) return this.warnAbortSignal()

    this.cached = err
    this.counter++
  }

  @action protected success(next: Result, signal: AbortSignal) {
    if (next === undefined) throw new Error(`Change undefined to null in response of ${this}`)
    this.hydrator.set(this.key, next)
    if (signal.aborted) return this.warnAbortSignal()

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
