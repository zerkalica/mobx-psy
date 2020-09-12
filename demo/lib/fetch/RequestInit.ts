import { FetchLike, SyncFetch } from 'mobx-psy'

export type DemoLibFetchRequestInit = RequestInit & {
  body?: RequestInit['body'] | Object
}

export type DemoLibFetch = FetchLike<DemoLibFetchRequestInit>
export type DemoLibFetchSync = SyncFetch<DemoLibFetchRequestInit>
