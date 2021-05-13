import { action, computed, makeObservable, observable } from 'mobx'

import { PsyContext } from '@psy/core/context/Context'
import { psyTaskDefer } from '@psy/core/task/Defer'

import { demoLibRouterClient } from './client'
import { DefaultParams, DemoLibRouterRoute } from './route'
import { DemoLibRouterParamMapper } from './serializer'

export class DemoLibRouterLocation {
  @observable protected search = this.client.location.search

  constructor(protected $: PsyContext, protected client = demoLibRouterClient) {
    makeObservable(this)
    client.addEventListener('popstate', this.onPopState)
  }

  protected destructor() {
    this.client.removeEventListener('popstate', this.onPopState)
  }

  @action.bound protected onPopState() {
    this.search = this.client.location.search
  }

  route<O extends DefaultParams>(defaults: O, mapper?: DemoLibRouterParamMapper<O>, deleteDefault = true): DemoLibRouterRoute<O> {
    return new DemoLibRouterRoute(defaults, mapper, deleteDefault, this)
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
    return this.client.location.origin + this.url(next)
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
    if (!this.scheduled && this.client !== demoLibRouterClient) {
      this.scheduled = true
      psyTaskDefer.add(this.updateHistory.bind(this))
    }
  }

  protected updateHistory() {
    const s = this.search || '/'

    if (this.replaceLast) this.client.history.replaceState(null, '', s)
    else this.client.history.pushState(null, '', s)

    this.scheduled = false
  }

  replace(key: string, next: string | undefined) {
    this.set(key, next, true)
  }

  static instance: DemoLibRouterLocation
}

DemoLibRouterLocation.instance = new DemoLibRouterLocation(PsyContext.instance)
