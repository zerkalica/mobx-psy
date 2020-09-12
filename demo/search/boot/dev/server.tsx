import '@demo/lib-server-polyfill'

import { demoLibServerDev } from '@demo/lib-server'
import React from 'react'

import { DemoSearch, demoLibSearchPkgName } from '../..'
import { demoLibSearchBootDevMocks } from './mocks'
import { demoLibSearchBootCommonServerConfig } from '../common/serverConfig'
import { demoLibSearchBootDevBrowserConfig } from './browserConfig'

const distRoot = __dirname

const fetch = demoLibSearchBootDevMocks({
  errorRate: 1,
  timeout: 100,
})

demoLibServerDev({
  ...demoLibSearchBootCommonServerConfig,
  ...demoLibSearchBootDevBrowserConfig,
  fetch,
  distRoot,
  pkgName: demoLibSearchPkgName,
  render: ({ location, fetcher }) => (
    <DemoSearch id={demoLibSearchPkgName} location={location} fetch={fetcher.fetch} />
  ),
})
