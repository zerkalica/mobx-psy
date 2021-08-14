import nodeFetch from 'node-fetch'

import { PsyFetcher } from './Fetcher'

export class PsyFetcherNode extends PsyFetcher {
  static fetch = (nodeFetch as unknown) as typeof fetch
}
