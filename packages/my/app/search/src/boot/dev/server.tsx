import '@my/server-polyfill'

import { myServerDev } from '@my/server'
import React from 'react'

import { MySearch, mySearchPkgName } from '../..'
import { mySearchBootDevMocks } from './mocks'
import { mySearchBootCommonServerConfig } from '../common/serverConfig'
import { mySearchBootDevBrowserConfig } from './browserConfig'

const distRoot = __dirname

const fetch = mySearchBootDevMocks({
  errorRate: 1,
  timeout: 100,
})

myServerDev({
  ...mySearchBootCommonServerConfig,
  ...mySearchBootDevBrowserConfig,
  fetch,
  distRoot,
  pkgName: mySearchPkgName,
  render: ({ location, fetcher }) => (
    <MySearch id={mySearchPkgName} location={location} fetch={fetcher.fetch} />
  ),
})
