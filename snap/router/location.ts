import { action, computed, makeObservable, observable } from 'mobx'

import { psyClient } from '@psy/core/client/client'

export class SnapRouterLocation {
  constructor(protected client: Omit<typeof psyClient, typeof Symbol.toStringTag>) {
    makeObservable(this)
    client.addEventListener('popstate', this.onPopState)
  }

  static cache: SnapRouterLocation | undefined = undefined
  static get instance() {
    return this.cache ?? (this.cache = new SnapRouterLocation(psyClient))
  }

  protected destructor() {
    this.client.removeEventListener('popstate', this.onPopState)
  }

  @observable protected counter = 0

  @action.bound protected onPopState() {
    this.counter++
  }

  @computed get url() {
    this.counter
    return this.client.location.pathname + this.client.location.search
  }

  @computed get id() {
    this.counter
    return (this.client.history.state as string | undefined) ?? 'SnapRouterLocation@Id'
  }

  protected createId() {
    return '' + new Date().getTime() + '_' + Math.floor(Math.random() * 1e8)
  }

  @action.bound push(url: string) {
    this.client.history.pushState(this.createId(), '', url)
    this.counter++
  }

  @action.bound replace(url: string) {
    this.client.history.replaceState(this.id, '', url)
    this.counter++
  }
}
