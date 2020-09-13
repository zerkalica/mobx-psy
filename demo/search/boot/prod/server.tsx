import '@demo/lib-server/polyfill'

import fetch from 'node-fetch'
import React from 'react'

import { DemoLibFetch } from '@demo/lib-fetch'
import { demoLibServerProd } from '@demo/lib-server'

import { demoSearchPkgName } from '../../pkgName'
import { DemoSearch } from '../../search'
import { demoSearchBootCommonServerConfig } from '../common/serverConfig'
import { demoSearchBootProdBrowserConfig } from './browserConfig'

const distRoot = __dirname

demoLibServerProd({
  ...demoSearchBootProdBrowserConfig,
  ...demoSearchBootCommonServerConfig,
  pkgName: demoSearchPkgName,
  fetch: fetch as DemoLibFetch,
  distRoot,
  render: ({ location, fetcher }) => (
    <DemoSearch id={demoSearchPkgName} location={location} fetch={fetcher.fetch} />
  ),
})
