import { action, observable, computed } from 'mobx'
import { DefaultParams, Route } from './Route'
import { ParamMapper } from './Serializer'

export interface LocationLike {
  search: string
  origin: string
  pathname: string
  port: string
  hostname: string
}

export interface HistoryLike {
  pushState(data: any, title: string, url?: string | null): void
  replaceState(data: any, title: string, url?: string | null): void
}

const defaultLocation: LocationLike = {
  search: '',
  origin: '',
  pathname: '',
  port: '',
  hostname: '',
}

export class LocationStore {
  @observable protected search: string = this.location.search

  constructor(
    protected location: LocationLike = defaultLocation,
    protected history?: HistoryLike,
    protected target?: Window
  ) {
    if (target) {
      target.addEventListener('popstate', this.onPopState)
    }
  }

  @action.bound protected onPopState() {
    this.search = this.location.search
  }

  route<O extends DefaultParams>(
    defaults: O,
    mapper?: ParamMapper<O>,
    deleteDefault = true
  ): Route<O> {
    return new Route(defaults, mapper, deleteDefault, this)
  }

  @computed get params(): Readonly<{ [id: string]: string }> {
    const params = new URLSearchParams(this.search)
    const result: { [id: string]: string } = {}
    params.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  url(next: { [id: string]: string | undefined }): string {
    const params = new URLSearchParams()
    let hash = ''
    for (let key in next) {
      const value = next[key]
      if (value === undefined) continue
      if (key === '#') hash = value
      else params.set(key, value)
    }
    const query = params.toString()
    const hashStr = hash ? `#${hash}` : ''
    const queryStr = query ? `?${query}` : ''

    return `${queryStr}${hashStr}`
  }

  fullUrl(next: { [id: string]: string } = {}): string {
    return this.location.origin + this.url(next)
  }

  protected scheduled = false
  protected replaceLast = false

  get(key: string): string | undefined {
    const param = this.params[key]
    return param === null ? undefined : param
  }

  set(key: string, next: string | undefined, replace: boolean = false) {
    const params = { ...this.params, [key]: next }
    this.search = this.url(params)
    this.replaceLast = replace
    if (!this.scheduled && this.history) {
      this.scheduled = true
      requestAnimationFrame(this.updateHistory.bind(this))
    }
  }

  protected updateHistory() {
    const { history, search } = this
    if (history) {
      const s = search || '/'
      if (this.replaceLast) history.replaceState(null, '', s)
      else history.pushState(null, '', s)
    }
    this.scheduled = false
  }

  replace(key: string, next: string | undefined) {
    this.set(key, next, true)
  }
}