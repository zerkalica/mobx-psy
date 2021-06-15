import { action, computed, observable } from 'mobx'

import { PsyContext } from '@psy/core/context/Context'
import { PsyFetcher } from '@psy/core/fetcher/Fetcher'
import { PsySyncModel } from '@psy/core/sync/Model'

import { AcmeSearchFlatListRoute } from './ListRoute'

export interface AcmeSearchFlatDTO {
  id: string
  house: boolean
  rooms: number
}

export class AcmeSearchFlatModel {
  constructor(protected $: PsyContext, readonly dto: Readonly<AcmeSearchFlatDTO>, protected io = $.get(PsyFetcher)) {}
}

export class AcmeSearchFlatModelStore extends PsySyncModel {
  constructor(
    protected $: PsyContext,
    protected options: { id: string },
    protected listRoute = $.get(AcmeSearchFlatListRoute.instance)
  ) {
    super($)
  }

  static cache?: AcmeSearchFlatModelStore = undefined

  static get instance() {
    return this.cache ?? (this.cache = new AcmeSearchFlatModelStore(PsyContext.instance, { id: 'root' }))
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

  args() {
    return {
      kind: 'flats',
      params: this.filter,
    } as const
  }

  check(some: any): some is {
    items: readonly AcmeSearchFlatDTO[]
    total_pages: number
  } {
    if (typeof some !== 'object') return false
    if (!some) return false
    if (!Array.isArray(some.items)) return false
    if (some.total_pages === undefined) return false

    return true
  }

  @computed get data() {
    const data = super.data
    if (!this.check(data)) throw new Error('Not valid data')

    this.lastTotalPages = data.total_pages

    return {
      ...data,
      items: data.items.map(this.item, this),
    }
  }

  protected item(item: AcmeSearchFlatDTO) {
    return new AcmeSearchFlatModel(this.$, item)
  }

  @computed get filtered() {
    return [...this.savedItems, ...this.data.items]
  }
}
