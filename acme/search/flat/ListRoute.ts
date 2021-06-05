import { NullablePartial, SnapRouterCodec } from '@snap/router/codec'
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
  ) {}

  static instance = new AcmeSearchFlatListRoute()

  protected codec() {
    return new SnapRouterCodec(
      (
        t,
        p: Record<
          'project' | 'region' | 'deal' | 'realty' | 'parking' | 'priceMaxDeshevie' | 'priceMaxNumber' | 'metro' | 'remont',
          typeof t
        >,
        opt = (...strs: string[]) => t`(?:` + strs.join(t`|`) + t`)?`
      ) => [
        '/' + p.project`nedvishimost`,
        opt('/' + p.region`\w+`),
        opt('/' + p.deal(dealSegMap) + `-` + p.realty(realtySegMap)),
        opt('/' + p.priceMaxDeshevie`deshevie`, p.priceMaxNumber`do-${val => val`d{1,2}`}-mln-rub`),
        opt('/' + p.metro`metro-${val => val`.+`}`),
        opt('/' + p.remont`s-remontom`),
        opt('/' + p.parking(parkingSegMap)),
      ]
    )
  }

  protected codecCached = this.codec()

  protected regionInfo(p: { id: number; slug?: undefined } | { id?: undefined; slug: string }) {
    // Place here suspense logic id by slug
    if (p.id === 444 || p.slug === 'spb')
      return {
        id: 444,
        slug: 'spb',
        deshevie: 6.5e6,
        metro: [
          {
            id: 3,
            slug: 'chertanovo',
          },
        ],
      }

    if (p.id === 3 || p.slug === 'msk')
      return {
        id: 3,
        slug: 'msk',
        deshevie: 8.5e6,
        metro: [
          {
            id: 33,
            slug: 'akademicheskaya',
          },
        ],
      }
  }

  params(url = this.loc.url ?? '/') {
    const { seg, query } = this.codecCached.match(url)

    if (!seg) return

    const project = seg.project

    if (!project) return
    if (!seg.region) return

    const regionInfo = this.regionInfo({ slug: seg.region })

    if (!regionInfo) return

    let priceMax = query.price?.map(Number)?.[0]
    if (seg.priceMaxDeshevie) priceMax = regionInfo.deshevie
    if (seg.priceMaxNumber) priceMax = priceMaxSegMap.param(seg.priceMaxNumber)?.[0]

    const parkingSeg = parkingSegMap.param(seg.parking)
    const parking = parkingSeg ?? parkingMap.param(query.parking)

    let metroIds = query.metroIds?.map(Number).filter(n => !Number.isNaN(n))
    if (seg.metro) metroIds = regionInfo.metro.filter(metro => metro.slug === seg.metro).map(metro => metro.id)

    const dealSeg = dealSegMap.param(seg.deal)?.[0]
    const deal = dealSeg ?? dealMap.param(query.deal)?.[0] ?? 'SELL'

    const realtySeg = realtySegMap.param(seg.realty)?.[0]
    const realty = realtySeg ?? realtyMap.param(query.realty)?.[0] ?? 'FLAT'

    const remont = seg.remont || query.remont?.[0] === '1' ? true : undefined

    let roomCount = query.roomCount?.length ? Number(query.roomCount[0]) : undefined
    if (Number.isNaN(roomCount)) roomCount = undefined

    let page = query.page?.length ? Number(query.page[0]) : undefined
    if (Number.isNaN(page)) page = undefined

    const out = {
      seg: {
        remont,
        regionId: regionInfo.id,
        deal: dealSeg,
        realty: realtySeg,
        priceMax: seg.priceMaxNumber || seg.priceMaxDeshevie ? priceMax : undefined,
        parking: parkingSeg,
        metroIds: seg.metro ? metroIds : undefined,
      },
      roomCount,
      remont,
      deal,
      realty,
      page,
      metroIds,
      regionId: regionInfo.id,
      priceMax,
      parking,
    }

    return out as Readonly<NullablePartial<typeof out>>
  }

  paramsReq(url = this.loc.url) {
    const params = this.params(url)

    if (!params) throw new Error(`Required params`)

    return params
  }

  protected nullableKeys = this.codecCached.keys.filter(k => k !== 'project' && k !== 'region' && k !== 'deal' && k !== 'realty')

  url(params: Omit<ReturnType<this['paramsReq']>, 'seg'>) {
    const { seg, query } = this.codecCached.initial()

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

    return this.codecCached.url({
      seg,
      query,
    })
  }

  push(params: Omit<ReturnType<this['paramsReq']>, 'seg'>) {
    const url = this.url(params)
    if (this.loc.push === undefined) throw new Error('loc.push not setted')
    this.loc.push(url)
  }

  replace(params: Omit<ReturnType<this['paramsReq']>, 'seg'>) {
    const url = this.url(params)
    if (this.loc.replace === undefined) throw new Error('loc.replace not setted')
    this.loc.replace(url)
  }
}
