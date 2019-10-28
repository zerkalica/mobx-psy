import { FetchLike, HydratedState } from 'mobx-psy'
import React from 'react'
import ReactDOM from 'react-dom'

import { MobxPsyExamples, LocationStore, pkgName, stateKey } from '../..'

export interface BrowserInitProps {
  apiUrl?: string
  fetch: FetchLike
  window: Window
}

export function browserInit({
  window,
  fetch: fetchRaw,
  apiUrl = '/',
}: BrowserInitProps) {
  const location = new LocationStore(window.location, window.history, window)
  const cache = ((window as unknown) as { [stateKey]?: HydratedState })[
    stateKey
  ]
  const fetch: FetchLike<any> = (url, params) => fetchRaw(apiUrl + url, params)

  ReactDOM.render(
    <MobxPsyExamples location={location} fetch={fetch} cache={cache} />,
    window.document.getElementById(pkgName)
  )
}
