import { HydratedState, FetchLike } from 'mobx-psy'
import React from 'react'
import ReactDOM from 'react-dom'

import { App } from '../App'
import { createFetch } from '../mocks'
import { pkgName, stateKey } from '../pkg'
import { LocationStore } from '../router'

export type AppBrowserProps = Partial<Parameters<typeof createFetch>[0]> & {
  apiUrl?: string
  window: Window
}

export function appBrowser({
  window,
  errorRate = 0.9,
  timeout = 500,
  apiUrl = '/',
}: AppBrowserProps) {
  const fetchRaw = createFetch({
    errorRate,
    timeout,
  })
  const location = new LocationStore(window.location, window.history, window)
  const cache = ((window as unknown) as { [stateKey]?: HydratedState })[
    stateKey
  ]
  const fetch: FetchLike<any> = (url, params) => fetchRaw(apiUrl + url, params)

  ReactDOM.render(
    <App location={location} fetch={fetch} cache={cache} />,
    window.document.getElementById(pkgName)
  )
}
