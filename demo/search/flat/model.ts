import { action, computed, makeObservable, observable, reaction } from 'mobx'

import { DemoLibRouterLocation } from '@demo/lib-router/location'
import { PsyContextRegistry } from '@psy/context/Registry'
import { effect, Loader } from '@psy/mobx'
import { Fetcher } from '@psy/ssr/Fetcher'

import { DemoSearchFlatFilterModel } from './filter/model'

export abstract class DemoSearchFlatDTO {
  id!: string
  house!: boolean
  rooms!: number
}

export class DemoSearchFlatModel extends DemoSearchFlatDTO {
  constructor(protected $: PsyContextRegistry, v: DemoSearchFlatDTO, protected io = $.v(Fetcher)) {
    super()
    Object.assign(this, v)
  }
}

export class DemoSearchFlatModelStore {
  constructor(protected $: PsyContextRegistry, protected id: string, protected location = $.v(DemoLibRouterLocation)) {
    makeObservable(this)
    effect(this, 'filtered', () => reaction(() => JSON.stringify(this.filter.values), this.pageReset))
  }

  @computed get filter() {
    return new DemoSearchFlatFilterModel(this.$)
  }

  @computed protected get params() {
    return this.location.route({
      page: 1,
    }).values
  }

  get page() {
    return Math.max(1, Math.min(this.params.page, this.lastTotalPages))
  }

  @action.bound setPage(next: number) {
    this.params.page = Math.max(1, Math.min(next, this.lastTotalPages))
  }

  @action.bound protected pageReset() {
    this.setPage(1)
    this.moreReset()
  }

  @action.bound next() {
    this.setPage(this.page + 1)
    this.moreReset()
  }

  get nextDisabled() {
    return this.page >= this.lastTotalPages
  }

  @action.bound prev() {
    this.setPage(this.page - 1)
    this.moreReset()
  }

  get prevDisabled() {
    return this.page <= 1
  }

  @observable protected savedItems: DemoSearchFlatModel[] = []
  @action.bound more() {
    this.savedItems = this.filtered
    this.setPage(this.page + 1)
  }

  protected moreReset() {
    this.savedItems = []
  }

  get moreDisabled() {
    return this.nextDisabled
  }

  protected lastTotalPages = 1

  get totalPages() {
    return this.lastTotalPages
  }

  @computed get loader() {
    return new Loader<{
      items: DemoSearchFlatDTO[]
      total_pages: number
    }>(this.$, {
      kind: 'flats',
      params: {
        ...this.params,
        ...this.filter.values,
      },
    })
  }

  @computed get response() {
    const response = this.loader.value

    this.lastTotalPages = response.total_pages

    return {
      ...response,
      items: response.items.map(item => new DemoSearchFlatModel(this.$, item)),
    }
  }

  @action.bound refresh() {
    this.loader.reload()
  }

  @computed get filtered() {
    return [...this.savedItems, ...this.response.items]
  }
}
