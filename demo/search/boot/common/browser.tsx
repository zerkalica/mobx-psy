import React from 'react'
import ReactDOM from 'react-dom'

import { demoLibIOFetchWrap } from '@demo/lib-io/fetchWrap'
import { DemoLibIOContext } from '@demo/lib-io/io'
import { DemoLibRouterLocation } from '@demo/lib-router/location'
import { DemoLibUIContextBuilder } from '@demo/lib-ui/context'
import { suspendify } from '@psy/core'

import { demoSearchPkgName } from '../../pkgName'
import { DemoSearch } from '../../search'
import { demoSearchBootCommonBrowserConfig } from './browserConfig'

export function demoSearchBootCommonBrowser({
  fetchFn: fetchRaw = fetch,
  browserConfig = demoSearchBootCommonBrowserConfig,
}: {
  fetchFn?: typeof fetch
  browserConfig?: typeof demoSearchBootCommonBrowserConfig
} = {}) {
  const cache = (window as any)[demoSearchPkgName]
  const config = cache.__config ?? browserConfig
  const loc = new DemoLibRouterLocation(location, history, window)
  const fetchFn = demoLibIOFetchWrap({ fetchFn: fetchRaw, apiUrl: config.apiUrl })
  const syncFetch = suspendify({ fetchFn, cache })

  const Provider = new DemoLibUIContextBuilder().v(DemoLibIOContext.Provider, {
    fetch: syncFetch,
    location: loc,
  }).Provider

  ReactDOM.render(
    <Provider>
      <DemoSearch id={demoSearchPkgName} />
    </Provider>,
    document.getElementById(`${demoSearchPkgName}-main`)
  )
}
