import { action, computed, observable, reaction } from 'mobx'
import { effect, sync } from 'mobx-psy'
import { MyFetchSync, useMyFetchContext } from '@my/fetch'
import { MyRouterLocation } from '@my/router'
import React from 'react'

import { MySearchFlatModelFilter } from './Filter'

export interface MySearchFlatDto {
  id: string
  house: boolean
  rooms: number
}

export class MySearchFlatModel {
  readonly id: string
  readonly rooms: number
  readonly house: boolean

  constructor(dto: MySearchFlatDto) {
    this.id = dto.id
    this.rooms = dto.rooms
    this.house = dto.house
  }
}

export class MySearchFlatModelStore {
  constructor(protected location: MyRouterLocation, protected fetch: MyFetchSync) {
    effect(this, 'filtered', () => reaction(() => JSON.stringify(this.filter.values), this.pageReset))
  }

  static use() {
    const { fetch, location } = useMyFetchContext()

    return React.useMemo(() => new this(location, fetch), [fetch, location])
  }

  @computed get filter() {
    return new MySearchFlatModelFilter(this.location)
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

  @observable protected savedItems: MySearchFlatModel[] = []
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
    }) as  {
      items: MySearchFlatDto[]
      total_pages: number
    }

    this.lastTotalPages = response.total_pages

    return {
      ...response,
      items: response.items.map(item => this.normalize(item)),
    }
  }

  protected normalize(raw: MySearchFlatDto): MySearchFlatModel {
    return new MySearchFlatModel(raw)
  }

  @action.bound refresh() {
    sync.refresh(() => this.response)
  }

  @computed get filtered() {
    return [...this.savedItems, ...this.response.items]
  }
}
