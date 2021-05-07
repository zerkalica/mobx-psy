import { Fetcher, FetchInitBase } from './Fetcher'

export class FetcherBrowser extends Fetcher {
  constructor(
    protected options: {
      apiUrl: string
    }
  ) {
    super()
  }

  async get(args: FetchInitBase, signal: AbortSignal) {
    const body = this.serializeBody(args.params)

    const init: RequestInit = {
      ...args,
      signal,
      body,
    }

    const url = this.options.apiUrl + args.kind

    const resp = await fetch(url, init)

    return resp.json()
  }
}
