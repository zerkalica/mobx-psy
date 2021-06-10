import { action, computed, makeObservable, observable } from 'mobx'

import { PsyContext } from '@psy/core/context/Context'
import { PsyFetcher } from '@psy/core/fetcher/Fetcher'
import { PsySyncLoader } from '@psy/core/sync/Loader'

import { AcmeSearchFlatListRoute } from './ListRoute'

export interface AcmeSearchFlatDTO {
  id: string
  house: boolean
  rooms: number
}

export class AcmeSearchFlatModel {
  constructor(protected $: PsyContext, readonly dto: Readonly<AcmeSearchFlatDTO>, protected io = $.get(PsyFetcher)) {}
}

export class AcmeSearchFlatModelStore {
  constructor(
    protected $: PsyContext,
    protected options: { id: string },
    protected listRoute = $.get(AcmeSearchFlatListRoute.instance)
  ) {
    makeObservable(this)
  }

  protected get filter() {
    return this.listRoute.get
  }

  get page() {
    return Math.max(1, Math.min(this.filter.page ?? 1, this.lastTotalPages))
  }

  @action.bound setPage(next: number) {
    const page = Math.max(1, Math.min(next, this.lastTotalPages))
    this.listRoute.push({ ...this.filter, page })
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

  protected payload() {
    return {
      kind: 'flats',
      params: this.filter,
    } as const
  }

  protected loader = new PsySyncLoader<{
    items: readonly AcmeSearchFlatDTO[]
    total_pages: number
  }>(this.$, this.payload.bind(this))

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
