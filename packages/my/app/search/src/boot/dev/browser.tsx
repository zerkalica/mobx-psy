import '@my/browser-polyfill'

import React from 'react'
import ReactDOM from 'react-dom'

import { myBrowserContext } from '@my/browser'

import { MySearch, mySearchPkgName } from '../..'
import { mySearchBootDevBrowserConfig } from './browserConfig'
import { mySearchBootDevMocks } from './mocks'

const fetch = mySearchBootDevMocks({
  errorRate: 0.9,
  timeout: 500,
})

const context = myBrowserContext({ ...mySearchBootDevBrowserConfig, window, fetch, pkgName: mySearchPkgName })

ReactDOM.render(
  <MySearch id={mySearchPkgName} location={context.location} fetch={context.fetch} />,
  context.container
)
