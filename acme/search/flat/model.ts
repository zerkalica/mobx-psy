import { action, computed, makeObservable, observable, reaction } from 'mobx'

import { PsyContext } from '@psy/core/context/Context'
import { PsyFetcher } from '@psy/core/fetcher/Fetcher'
import { psySyncEffect } from '@psy/core/sync/effect'
import { PsySyncLoader } from '@psy/core/sync/Loader'
import { SnapRouterLocation } from '@snap/router/location'

import { AcmeSearchFlatFilterModel } from './filter/model'

export interface AcmeSearchFlatDTO {
  id: string
  house: boolean
  rooms: number
}

export class AcmeSearchFlatModel {
  constructor(protected $: PsyContext, readonly dto: Readonly<AcmeSearchFlatDTO>, protected io = $.get(PsyFetcher)) {}
}

export class AcmeSearchFlatModelStore {
  constructor(protected $: PsyContext, protected options: { id: string }, protected location = $.get(SnapRouterLocation.instance)) {
    makeObservable(this)
    psySyncEffect(this, 'filtered', () => reaction(() => JSON.stringify(this.filter.values), this.pageReset))
  }

  @computed get filter() {
    return new AcmeSearchFlatFilterModel(this.$)
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

  @observable protected savedItems: AcmeSearchFlatModel[] = []

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

  @computed protected get loader() {
    return new PsySyncLoader<{
      items: readonly AcmeSearchFlatDTO[]
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
      items: response.items.map(item => new AcmeSearchFlatModel(this.$, item)),
    }
  }

  @action.bound refresh() {
    this.loader.refresh()
  }

  @computed get filtered() {
    return [...this.savedItems, ...this.response.items]
  }
}