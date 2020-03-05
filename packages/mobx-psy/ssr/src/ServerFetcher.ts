import { HydratedState, FetchLike, SyncFetch, fiberizeFetch } from 'mobx-psy'

export class ServerFetcher<Init = RequestInit> {
  protected promises: PromiseLike<[string, any]>[] = []
  protected state: HydratedState = {}

  readonly fetch: SyncFetch<Init>

  constructor(
    protected options: {
      apiUrl: string
      fetch: FetchLike<Init>
    }
  ) {
    this.fetch = fiberizeFetch(this.normalizedFetch.bind(this), this.state, true)
  }

  protected normalizedFetch(url: string, init: Init) {
    const { options } = this
    const promise = options.fetch(options.apiUrl + url, init)

    this.promises.push(promise.then(data => [url, data]))

    return promise
  }

  collectState() {
    return Promise.all(this.promises).then(items => {
      for (let [url, data] of items) this.state[url] = data
      const end = items.length === 0
      this.promises = []

      return {
        state: this.state,
        end,
      }
    })
  }
}
