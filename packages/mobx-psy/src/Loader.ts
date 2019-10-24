import { action, computed, observable } from 'mobx'

import { disposer } from './disposer'
import { throwHidden } from './utils'

export interface RequestInfo<Params extends {} = {}> {
  readonly name: string
  readonly params: Readonly<Params>
  refresh(): void
  readonly initial: boolean
}

export type FetchFn<
  Name extends string = string,
  Params extends {} = {},
  Result extends {} = any
> = (name: Name, params: Params, signal: AbortSignal) => Promise<Result>

const responseKey = Symbol('Response')

type ResponseTarget = (Promise<any> | Error) & { [responseKey]?: Response }

export function getResponse(target: ResponseTarget): undefined | Response {
  return target[responseKey]
}

function setResponse(target: ResponseTarget, loader: Response) {
  ;(target as any)[responseKey] = loader
}

const throwOnAccess = {
  get(target: any, key: string | Symbol | number) {
    return throwHidden(target)
  },
  ownKeys(target: any): string[] {
    return throwHidden(target)
  },
}

export function parallel<V extends {}>(v: () => V): V {
  try {
    return v()
  } catch (e) {
    return new Proxy(e, throwOnAccess)
  }
}

export class Response<
  Name extends string = any,
  Params extends {} = any,
  Result extends {} = any
> implements RequestInfo<Params> {
  @observable protected state: Result | undefined
  @observable protected error: Error | undefined
  protected loading: Promise<void> | undefined = undefined

  constructor(
    readonly name: Name,
    readonly params: Readonly<Params>,
    protected fetcher: FetchFn<Name, Params, Result>,
    protected logger: Logger,
    protected dispose: () => void = () => {},
    public initial: boolean = true
  ) {
    disposer(this, 'data', () => this.destructor.bind(this))
  }

  toString() {
    return this[Symbol.toStringTag]
  }

  get [Symbol.toStringTag]() {
    return `${this.name}`
  }

  protected destructor() {
    this.logger.log(this, 'destructor')
    this.ac.abort()
    this.dispose()
  }

  @observable protected count = 0

  @computed get data(): Result {
    const { error, state, count } = this
    if (!error && !this.loading && count === 0) this.load()

    if (this.loading) throw this.loading
    if (error) throw error

    this.initial = false

    return state as Result
  }

  @action.bound protected success(state: Result) {
    this.state = state
    this.error = undefined
    this.loading = undefined
    this.count++
    this.logger.log(this, 'success')
  }

  @action.bound protected setError(error: Error) {
    setResponse(error, this)
    this.error = error
    this.loading = undefined
    this.count++
    this.logger.error(this, error)
  }

  protected ac = new AbortController()

  @action.bound refresh() {
    this.load()
    this.count++
  }

  protected load() {
    this.ac.abort()
    this.ac = new AbortController()
    this.logger.log(this, 'loading')
    this.loading = this.fetcher(this.name, this.params, this.ac.signal).then(
      this.success,
      this.setError
    )
    setResponse(this.loading, this)
  }
}

function defaultFetcher<Params>(
  name: string,
  params: Params,
  signal: AbortSignal
) {
  return Promise.resolve({})
}

export type LoggerSubject = { [Symbol.toStringTag]: string }

export class Logger {
  log(subject: LoggerSubject, action: string) {
    console.log(`${subject} ${action}`)
  }
  error(subject: LoggerSubject, error: Error) {
    console.error(`${subject} ${error}`)
  }
}

export class Request<Name extends string, Params, Result> {
  constructor(
    readonly name: Name,
    protected fetcher: FetchFn<Name, Params, Result>,
    protected logger: Logger
  ) {}

  protected responses = new Map<string, Response<Name, Params, Result>>()
  protected initial = true

  get(params: Params, retry: number = 0): Result {
    const { responses } = this
    const key = JSON.stringify(params) + String(retry)
    let response = responses.get(key)
    if (response) return response.data

    response = new Response(
      this.name,
      params,
      this.fetcher,
      this.logger,
      responses.delete.bind(responses, key),
      this.initial
    )
    this.initial = false
    responses.set(key, response)

    return response.data
  }
}

export class Loader {
  constructor(
    protected fetcher: FetchFn = defaultFetcher,
    protected logger: Logger = new Logger()
  ) {}

  create<Result, Name extends string = string, Params extends {} = {}>(
    name: Name,
    fetcher?: FetchFn<Name, Params, Result>
  ) {
    return new Request<Name, Params, Result>(
      name,
      fetcher || this.fetcher,
      this.logger
    )
  }
}
