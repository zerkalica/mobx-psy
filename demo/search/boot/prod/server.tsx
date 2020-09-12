import '@demo/lib-server-polyfill'

import { DemoLibFetch } from '@demo/lib-fetch'
import { demoLibServerProd } from '@demo/lib-server'
import fetch from 'node-fetch'
import React from 'react'

import { DemoSearch, demoLibSearchPkgName } from '../..'
import { demoLibSearchBootCommonServerConfig } from '../common/serverConfig'
import { demoLibSearchBootProdBrowserConfig } from './browserConfig'

const distRoot = __dirname

demoLibServerProd({
  ...demoLibSearchBootProdBrowserConfig,
  ...demoLibSearchBootCommonServerConfig,
  pkgName: demoLibSearchPkgName,
  fetch: fetch as DemoLibFetch,
  distRoot,
  render: ({ location, fetcher }) => (
    <DemoSearch id={demoLibSearchPkgName} location={location} fetch={fetcher.fetch} />
  ),
})
