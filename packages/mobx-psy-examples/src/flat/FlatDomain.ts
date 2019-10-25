import React from 'react'
import { action, computed, observable, reaction } from 'mobx'
import { LocationStore } from '../router'
import { sync, disposer } from 'mobx-psy'
import { useServiceContext, Fetch } from '../ServiceContext'
import { IFlat } from '../mocks'
import { FlatDomainFilter } from './FlatDomainFilter'

export class Flat {
  readonly id: string
  readonly rooms: number
  readonly house: boolean

  constructor(dto: IFlat) {
    this.id = dto.id
    this.rooms = dto.rooms
    this.house = dto.house
  }
}

interface FlatsState {
  items: IFlat[]
  total_pages: number
}

export class FlatDomain {
  constructor(protected location: LocationStore, protected fetch: Fetch) {
    disposer(this, 'filtered', () =>
      reaction(() => JSON.stringify(this.filter.values), this.pageReset)
    )
  }

  static use() {
    const context = useServiceContext()
    return React.useMemo(
      () => new this(context.location, context.fetch),
      [context]
    )
  }

  @computed get filter() {
    return new FlatDomainFilter(this.location)
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

  @observable protected savedItems: Flat[] = []
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
    const response = this.fetch<FlatsState>(
      'flats',
      {
        ...this.params,
        ...this.filter.values,
      }
    )

    this.lastTotalPages = response.total_pages

    return {
      ...response,
      items: response.items.map(item => this.normalize(item)),
    }
  }

  protected normalize(raw: IFlat): Flat {
    return new Flat(raw)
  }

  refresh() {
    sync.refresh(() => this.response)
  }

  @computed get filtered() {
    return [...this.savedItems, ...this.response.items]
  }
}
