import { promisify } from 'mobx-psy'

import { DemoLibFetch } from '@demo/lib-fetch/fetch'

import { DemoSearchFlatModelProps } from '../../flat/model'

function createCreateId(prefix: string) {
  let id = 0
  return () => {
    return prefix + ++id
  }
}

function createFlatsMock() {
  const flatsAll: DemoSearchFlatModelProps[] = []
  const create_id = createCreateId('f')
  const totalItems = 100
  const page_size = 10
  for (let i = 0; i < totalItems; i++) {
    const id = create_id()
    flatsAll.push({
      id,
      rooms: 1 + Math.floor(Math.random() * 3),
      house: Math.random() >= 0.5,
    })
  }

  return (filter?: Partial<DemoSearchFlatModelProps & { page: number }>) => {
    const items = filter
      ? flatsAll.filter((flat) => {
          if (filter.house && !flat.house) return false
          return !filter.rooms || filter.rooms === flat.rooms
        })
      : flatsAll
    const total_pages = Math.ceil(items.length / page_size)
    const page = Math.min((filter && filter.page) || 1, total_pages) - 1
    const firstIndex = page_size * page
    const lastIndex = Math.min(items.length - 1, firstIndex + page_size - 1)

    return {
      items: items.slice(firstIndex, lastIndex),
      total_pages,
      page_size,
    }
  }
}

export function demoSearchBootDevMocks({
  errorRate,
  timeout,
}: {
  errorRate: number
  timeout: number
}): DemoLibFetch {
  const fetchFlats = createFlatsMock()

  return promisify(errorRate, timeout, (url, params) => {
    if (url === '/flats') return fetchFlats(typeof params?.body === 'string' ? JSON.parse(params.body) : {})

    throw new Error('404: ' + url)
  })
}
