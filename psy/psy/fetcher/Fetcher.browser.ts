import { PsyFetcher } from './Fetcher'

export class FetcherBrowser extends PsyFetcher {
  static fetch = fetch
}
