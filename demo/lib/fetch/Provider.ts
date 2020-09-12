import { DemoLibRouterLocation } from '@demo/lib-router'
import React from 'react'

import { DemoLibFetchSync } from './RequestInit'

export interface DemoLibFetchContextValue {
  location: DemoLibRouterLocation
  fetch: DemoLibFetchSync
}

const DemoLibFetchContext = React.createContext<DemoLibFetchContextValue | undefined>(undefined)

export const DemoLibFetchProvider = DemoLibFetchContext.Provider

export function useDemoLibFetchContext() {
  const context = React.useContext(DemoLibFetchContext)

  if (!context) throw new Error('Wrap your app into <DemoLibFetchProvider>')

  return context
}
