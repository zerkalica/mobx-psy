import '@demo/lib-browser/polyfill.js'

import React from 'react'
import ReactDOM from 'react-dom'

import { DemoLibFetchProvider } from '@demo/lib-fetch/fetch'
import { DemoLibRouterLocation } from '@demo/lib-router/location'
import { DemoLibUIContextBuilder } from '@demo/lib-ui/context'
import { suspendify } from '@psy/core'

import { demoSearchPkgName } from '../../pkgName'
import { DemoSearch } from '../../search'
import { demoSearchBootDevBrowserConfig } from './browserConfig'
import { demoSearchBootDevMocks } from './mocks'

const fetch = demoSearchBootDevMocks({
  errorRate: 0.9,
  timeout: 500,
})

const loc = new DemoLibRouterLocation(location, history, window)
const syncFetch = suspendify(
  (url: string, args) => fetch(demoSearchBootDevBrowserConfig.apiUrl + url, args),
  (window as any)[demoSearchPkgName]
)

const ctx = new DemoLibUIContextBuilder().v(DemoLibFetchProvider, {
  fetch: syncFetch,
  location: loc,
})

ReactDOM.render(
  <ctx.Provider>
    <DemoSearch id={demoSearchPkgName} />
  </ctx.Provider>,
  document.getElementById(`${demoSearchPkgName}-main`)
)
