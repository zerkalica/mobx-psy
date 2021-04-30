import { defaultHashFn, FetchInitBase, FetchLike, suspendify } from '@psy/core'

export class ServerFetcher {
  protected promises: PromiseLike<[string, any]>[] = []
  protected state: Record<string, any> = {}

  readonly fetch = suspendify({
    fetchFn: this.normalizedFetch.bind(this),
    cache: this.state,
    keepCache: true,
    hashFn: this.options.hashFn,
  })

  constructor(
    protected options: {
      fetchFn: FetchLike
      hashFn?: typeof defaultHashFn
    }
  ) {}

  protected normalizedFetch(init: FetchInitBase, signal: AbortSignal) {
    const promise = this.options.fetchFn(init, signal)
    const hashFn = this.options.hashFn ?? defaultHashFn
    const key = hashFn(init)
    this.promises.push(promise.then(data => [key, data]))

    return promise
  }

  async collectState() {
    const items = await Promise.all(this.promises)

    for (let [url, data] of items) {
      this.state[url] = data
    }

    const end = items.length === 0
    this.promises = []

    return {
      state: this.state,
      end,
    }
  }
}
