import { FetchLike, SyncFetch } from 'mobx-psy'

export type MyFetchRequestInit = RequestInit & {
  body?: RequestInit['body'] | Object
}

export type MyFetch = FetchLike<MyFetchRequestInit>
export type MyFetchSync = SyncFetch<MyFetchRequestInit>
