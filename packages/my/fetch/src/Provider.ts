import { MyRouterLocation } from '@my/router'
import React from 'react'

import { MyFetchSync } from './RequestInit'

export interface MyFetchContextValue {
  location: MyRouterLocation
  fetch: MyFetchSync
}

const MyFetchContext = React.createContext<MyFetchContextValue | undefined>(undefined)

export const MyFetchProvider = MyFetchContext.Provider

export function useMyFetchContext() {
  const context = React.useContext(MyFetchContext)

  if (!context) throw new Error('Wrap your app into <MyFetchProvider>')

  return context
}
