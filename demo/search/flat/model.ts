import { action, computed, makeObservable, observable, reaction } from 'mobx'

import { DemoLibIOContext } from '@demo/lib-io/io'
import { effect, sync } from '@psy/mobx'

import { DemoSearchFlatFilterModel } from './filter/model'

export abstract class DemoSearchFlatDTO {
  id!: string
  house!: boolean
  rooms!: number
}

export class DemoSearchFlatModel extends DemoSearchFlatDTO {
  constructor(v: DemoSearchFlatDTO, protected io = DemoLibIOContext.use()) {
    super()
    Object.assign(this, v)
  }
}

export class DemoSearchFlatModelStore {
  constructor(protected io = DemoLibIOContext.use()) {
    makeObservable(this)
    effect(this, 'filtered', () => reaction(() => JSON.stringify(this.filter.values), this.pageReset))
  }

  @computed get filter() {
    return new DemoSearchFlatFilterModel(this.io.location)
  }

  @computed protected get params() {
    return this.io.location.route({
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

  @sync get response() {
    const response = this.io.fetch({
      kind: 'flats',
      params: {
        ...this.params,
        ...this.filter.values,
      },
    }) as {
      items: DemoSearchFlatDTO[]
      total_pages: number
    }

    this.lastTotalPages = response.total_pages

    return {
      ...response,
      items: response.items.map(item => new DemoSearchFlatModel(item, this.io)),
    }
  }

  @action.bound refresh() {
    sync.refresh(() => this.response)
  }

  @computed get filtered() {
    return [...this.savedItems, ...this.response.items]
  }
}
