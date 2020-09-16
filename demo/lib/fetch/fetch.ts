import { FetchLike, SyncFetch } from '@psy/core'
import React from 'react'

import { DemoLibRouterLocation } from '@demo/lib-router/location'

export type DemoLibFetchRequestInit = RequestInit & {
  body?: RequestInit['body'] | Object
}

export type DemoLibFetch = FetchLike<DemoLibFetchRequestInit>
export type DemoLibFetchSync = SyncFetch<DemoLibFetchRequestInit>
export interface DemoLibFetchProps {
  location: DemoLibRouterLocation
  fetch: DemoLibFetchSync
}

const DemoLibFetchContext = React.createContext<DemoLibFetchProps | undefined>(undefined)

export const DemoLibFetchProvider = DemoLibFetchContext.Provider

export function useDemoLibFetch() {
  const context = React.useContext(DemoLibFetchContext)

  if (!context) throw new Error('Wrap your app into <DemoLibFetchProvider>')

  return context
}
