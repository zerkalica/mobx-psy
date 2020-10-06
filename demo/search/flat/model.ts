import { action, computed, observable, reaction } from 'mobx'
import { effect, sync } from '@psy/mobx'
import React from 'react'

import { DemoLibFetchSync, useDemoLibFetch } from '@demo/lib-fetch/fetch.js'
import { DemoLibRouterLocation } from '@demo/lib-router/location.js'

import { DemoSearchFlatFilterModel } from './filter/model'

export interface DemoSearchFlatModelProps {
  id: string
  house: boolean
  rooms: number
}

export class DemoSearchFlatModel {
  readonly id: string
  readonly rooms: number
  readonly house: boolean

  constructor(dto: DemoSearchFlatModelProps) {
    this.id = dto.id
    this.rooms = dto.rooms
    this.house = dto.house
  }
}

export class DemoSearchFlatModelStore {
  constructor(protected location: DemoLibRouterLocation, protected fetch: DemoLibFetchSync) {
    effect(this, 'filtered', () => reaction(() => JSON.stringify(this.filter.values), this.pageReset))
  }

  static use() {
    const { fetch, location } = useDemoLibFetch()

    return React.useMemo(() => new this(location, fetch), [fetch, location])
  }

  @computed get filter() {
    return new DemoSearchFlatFilterModel(this.location)
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

  @sync get response() {
    const response = this.fetch('flats', {
      body: JSON.stringify({
        ...this.params,
        ...this.filter.values,
      }),
    }) as {
      items: DemoSearchFlatModelProps[]
      total_pages: number
    }

    this.lastTotalPages = response.total_pages

    return {
      ...response,
      items: response.items.map((item) => this.normalize(item)),
    }
  }

  protected normalize(raw: DemoSearchFlatModelProps): DemoSearchFlatModel {
    return new DemoSearchFlatModel(raw)
  }

  @action.bound refresh() {
    sync.refresh(() => this.response)
  }

  @computed get filtered() {
    return [...this.savedItems, ...this.response.items]
  }
}
