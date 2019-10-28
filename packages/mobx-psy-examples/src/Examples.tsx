import { configure } from 'mobx'
import {
  FetchInitBase,
  FetchLike,
  fiberizeFetch,
  HydratedState,
} from 'mobx-psy'
import React from 'react'

import { FlatList } from './flat'
import { LocationStore } from './router'
import { ServiceContextProvider } from './ServiceContext'
import { pkgName } from './pkg'
// import * as styles from './Examples.css'

configure({
  enforceActions: 'observed',
})                                                                                                                                                                                                          

export function MobxPsyExamples<Init extends FetchInitBase>({
  fetch,
  location,
  cache,
  keepCache,
}: {
  fetch: FetchLike<Init>
  location: LocationStore
  cache?: HydratedState
  keepCache?: boolean
}) {
  return (
    <div id={`${pkgName}-app`}>
      <ServiceContextProvider
        value={{
          location,
          fetch: fiberizeFetch<Init>(fetch, cache, keepCache),
        }}
      >
        <h1>Flats:</h1>
        <FlatList />
      </ServiceContextProvider>
    </div>
  )
}
