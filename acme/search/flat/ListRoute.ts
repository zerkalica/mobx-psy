import { action, computed, makeObservable, observable } from 'mobx'

import { psyObjectMerge } from '@psy/core/object/merge'
import { psyObjectSetter } from '@psy/core/object/setter'
import { NullablePartial, SnapRouterCodec, SnapRouterCodecError } from '@snap/router/codec'
import { SnapRouterQueryMap } from '@snap/router/queryMap'
import { SnapRouterSegMap } from '@snap/router/segMap'

const priceMaxSegMap = new SnapRouterSegMap({
  '1': [1e6],
  '2': [2e6],
  '3': [3e6],
  '4': [4e6],
  '5': [5e6],
  '6': [6e6],
  '7': [7e6],
  '8': [8e6],
  '10': [10e6],
  '15': [15e6],
  '20': [20e6],
})

const parkingSegMap = new SnapRouterSegMap({
  's-parkovkoi': ['OPEN', 'UNDERGROUND'],
  's-podzemnoi-parkovkoi': ['UNDERGROUND'],
} as const)

const parkingMap = new SnapRouterQueryMap({
  OPEN: 'OPEN',
  UNDERGROUND: 'UNDERGROUND',
} as const)

const dealSegMap = new SnapRouterSegMap({
  pokupka: ['SELL'],
  arenda: ['RENT'],
} as const)

const dealMap = new SnapRouterQueryMap({
  SELL: 'SELL',
  RENT: 'RENT',
} as const)

const realtySegMap = new SnapRouterSegMap({
  kvartiri: ['FLAT'],
  komnati: ['ROOM'],
  doma: ['HOUSE'],
  uchastka: ['LAND'],
} as const)

const realtyMap = new SnapRouterQueryMap({
  FLAT: 'FLAT',
  ROOM: 'ROOM',
  HOUSE: 'HOUSE',
  LAND: 'LAND',
} as const)

export class AcmeSearchFlatListRoute {
  constructor(
    protected loc: { url?: string; push?(url: string): void; replace?(url: string): void } = {},
    protected ctx?: { isServer: boolean }
  ) {
    makeObservable(this)
  }

  @observable.struct writable = { ...this.get }

  protected codec = new SnapRouterCodec(
    (
      t,
      p: Record<
        'project' | 'region' | 'deal' | 'realty' | 'parking' | 'priceMaxDeshevie' | 'priceMaxNumber' | 'metro' | 'remont',
        typeof t
      >,
      opt = (...strs: string[]) => t`(?:` + strs.join(t`|`) + t`)?`
    ) => [
      '/' + p.project(this.root()),
      opt('/' + p.region`\\w+`),
      opt('/' + p.deal(dealSegMap.regExp) + `-` + p.realty(realtySegMap.regExp)),
      opt('/' + p.priceMaxDeshevie`deshevie`, p.priceMaxNumber`do-${val => val`\\d{1,2}`}-mln-rub`),
      opt('/' + p.metro`metro-${val => val`.+`}`),
      opt('/' + p.remont`s-remontom`),
      opt('/' + p.parking(parkingSegMap.regExp)),
      opt('/'),
      t`$`,
    ]
  )

  protected root() {
    return 'nedvishimost'
  }

  toString() {
    return this.codec.toString()
  }

  static instance = new AcmeSearchFlatListRoute()

  protected regionInfo(p: { id: number; slug?: undefined } | { id?: undefined; slug: string }) {
    // Place here suspense logic id by slug
    if (p.id === 444 || p.slug === 'sankt-peterburg')
      return {
        id: 444,
        slug: 'sankt-peterburg',
        deshevie: 6.5e6,
        metro: [
          {
            id: 3,
            slug: 'chertanovo',
          },
        ],
      }

    if (p.id === 3 || p.slug === 'moskva')
      return {
        id: 3,
        slug: 'moskva',
        deshevie: 8.5e6,
        metro: [
          {
            id: 33,
            slug: 'akademicheskaya',
          },
        ],
      }

    throw new Error('Region not found: ' + p.slug)
  }

  @computed protected get raw() {
    return this.codec.match(this.loc.url ?? '/')
  }

  @computed.struct get seg() {
    const { seg } = this.raw
    if (!seg) return

    const project = seg.project

    if (!project) return
    if (!seg.region) return

    const regionInfo = this.regionInfo({ slug: seg.region })

    let priceMax = seg.priceMaxDeshevie ? regionInfo.deshevie : undefined
    if (seg.priceMaxNumber) priceMax = priceMaxSegMap.param(seg.priceMaxNumber)?.[0]

    const parking = parkingSegMap.param(seg.parking)
    const metroIds = seg.metro ? regionInfo.metro.filter(metro => metro.slug === seg.metro).map(metro => metro.id) : undefined
    const deal = dealSegMap.param(seg.deal)?.[0] ?? 'SELL'
    const realty = realtySegMap.param(seg.realty)?.[0] ?? 'FLAT'
    const remont = seg.remont ? true : undefined

    const out = {
      remont,
      regionId: regionInfo.id,
      deal,
      realty,
      priceMax: seg.priceMaxNumber || seg.priceMaxDeshevie ? priceMax : undefined,
      parking,
      metroIds: seg.metro ? metroIds : undefined,
    }

    return out as NullablePartial<typeof out>
  }

  @computed.struct get get() {
    const seg = this.seg
    if (!seg) throw new SnapRouterCodecError(`${this.loc.url ?? '/'} not matched ${this}`)
    const { query } = this.raw
    const priceMax = query.price?.map(Number)?.[0]
    const parking = parkingMap.param(query.parking)
    const metroIds = query.metroIds?.map(Number).filter(n => !Number.isNaN(n))
    const deal = dealMap.param(query.deal)?.[0] ?? 'SELL'
    const realty = realtyMap.param(query.realty)?.[0] ?? 'FLAT'
    const remont = query.remont?.[0] === '1' ? true : undefined

    let roomCount = query.roomCount?.length ? Number(query.roomCount[0]) : undefined
    if (Number.isNaN(roomCount)) roomCount = undefined

    let page = query.page?.length ? Number(query.page[0]) : undefined
    if (Number.isNaN(page)) page = undefined

    const out = psyObjectMerge(seg, {
      roomCount,
      remont,
      deal,
      realty,
      page,
      metroIds,
      priceMax,
      parking,
    })

    return out as NullablePartial<typeof out>
  }

  @computed get changed() {
    return JSON.stringify(this.get) !== JSON.stringify(this.defaults)
  }

  @computed get defaults() {
    return new AcmeSearchFlatListRoute({ url: '/nedvishimost' }).get
  }

  @action.bound reset() {
    this.push(this.defaults)
  }

  readonly set = psyObjectSetter<this['get']>(action((k, v) => this.push({ ...this.get, [k]: v })))

  protected nullableKeys = this.codec.keys.filter(k => k !== 'project' && k !== 'region' && k !== 'deal' && k !== 'realty')

  url(params = this.defaults) {
    const { seg, query } = this.codec.initial()

    seg.project = true
    if (!params.regionId) throw new Error('Need an regionId')

    const regionInfo = this.regionInfo({ id: params.regionId })
    seg.region = regionInfo?.slug

    seg.deal = dealSegMap.query(params.deal)
    query.deal = dealMap.query(params.deal)

    seg.realty = realtySegMap.query(params.realty)
    query.realty = realtyMap.query(params.realty)

    if (regionInfo?.deshevie && params.priceMax === regionInfo.deshevie) seg.priceMaxDeshevie = 'deshevie'
    seg.priceMaxNumber = priceMaxSegMap.query(params.priceMax)
    query.priceMax = params.priceMax

    seg.parking = parkingSegMap.query(params.parking)
    query.parking = parkingMap.query(params.parking)

    const metroId = params.metroIds?.length === 1 ? params.metroIds[0] : undefined
    if (metroId) seg.metro = regionInfo?.metro.find(metro => (metro.id = metroId))?.slug
    query.metroIds = params.metroIds

    query.page = params.page

    seg.remont = params.remont
    query.remont = params.remont ? '1' : undefined

    query.roomCount = params.roomCount

    const keysWithData = this.nullableKeys.filter(v => seg[v] !== undefined)
    if (keysWithData.length > 2) {
      for (const key of this.nullableKeys) seg[key] = undefined
    }

    return this.codec.url({
      seg,
      query,
    })
  }

  @action.bound push(params = this.defaults) {
    const url = this.url(params)
    if (this.loc.push === undefined) throw new Error('loc.push not setted')
    this.loc.push(url)
  }

  @action.bound replace(params = this.defaults) {
    const url = this.url(params)
    if (this.loc.replace === undefined) throw new Error('loc.replace not setted')
    this.loc.replace(url)
  }
}
