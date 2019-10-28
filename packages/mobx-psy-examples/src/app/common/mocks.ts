function promisify<Result, Args extends any[]>(
  errorRate: number,
  timeout: number,
  cb: (...args: Args) => Result
): (...args: Args) => Promise<Result> {
  return (...args: Args) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > errorRate)
          return reject(new Error('Fake 500 error'))
        try {
          resolve(cb(...args))
        } catch (e) {
          reject(e)
        }
      }, timeout)
    })
  }
}

function createCreateId(prefix: string) {
  let id = 0
  return () => {
    return prefix + ++id
  }
}

export interface IFlat {
  id: string
  house: boolean
  rooms: number
}

function createFetchFlats() {
  const flatsAll: IFlat[] = []
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

  return (filter?: Partial<IFlat & { page: number }>) => {
    const items = filter
      ? flatsAll.filter(flat => {
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

export type Fetch<V = any> = (
  url: string,
  params?: {
    body?: object
    signal?: AbortSignal | null
    method?: string
  }
) => Promise<V>

export function createFetch({
  errorRate,
  timeout,
}: {
  errorRate: number
  timeout: number
}): Fetch {
  const fetchFlats = createFetchFlats()

  return promisify(errorRate, timeout, (url, params = {}): any => {
    if (url === '/flats') return fetchFlats(params.body)

    throw new Error('404: ' + url)
  })
}
