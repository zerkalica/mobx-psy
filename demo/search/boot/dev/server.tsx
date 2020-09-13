import '@demo/lib-server/polyfill'

import React from 'react'

import { demoLibServerDev } from '@demo/lib-server'

import { demoSearchPkgName } from '../../pkgName'
import { DemoSearch } from '../../search'
import { demoSearchBootCommonServerConfig } from '../common/serverConfig'
import { demoSearchBootDevBrowserConfig } from './browserConfig'
import { demoSearchBootDevMocks } from './mocks'

const distRoot = __dirname

const fetch = demoSearchBootDevMocks({
  errorRate: 1,
  timeout: 100,
})

demoLibServerDev({
  ...demoSearchBootCommonServerConfig,
  ...demoSearchBootDevBrowserConfig,
  fetch,
  distRoot,
  pkgName: demoSearchPkgName,
  render: ({ location, fetcher }) => (
    <DemoSearch id={demoSearchPkgName} location={location} fetch={fetcher.fetch} />
  ),
})
