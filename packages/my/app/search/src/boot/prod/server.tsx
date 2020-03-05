import '@my/server-polyfill'

import { MyFetch } from '@my/fetch'
import { myServerProd } from '@my/server'
import fetch from 'node-fetch'
import React from 'react'

import { MySearch, mySearchPkgName } from '../..'
import { mySearchBootCommonServerConfig } from '../common/serverConfig'
import { mySearchBootProdBrowserConfig } from './browserConfig'

const distRoot = __dirname

myServerProd({
  ...mySearchBootProdBrowserConfig,
  ...mySearchBootCommonServerConfig,
  pkgName: mySearchPkgName,
  fetch: fetch as MyFetch,
  distRoot,
  render: ({ location, fetcher }) => (
    <MySearch id={mySearchPkgName} location={location} fetch={fetcher.fetch} />
  ),
})
