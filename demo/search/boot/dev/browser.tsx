import '@demo/lib-browser-polyfill'

import React from 'react'
import ReactDOM from 'react-dom'

import { demoLibBrowserContext } from '@demo/lib-browser'

import { DemoSearch, demoLibSearchPkgName } from '../..'
import { demoLibSearchBootDevBrowserConfig } from './browserConfig'
import { demoLibSearchBootDevMocks } from './mocks'

const fetch = demoLibSearchBootDevMocks({
  errorRate: 0.9,
  timeout: 500,
})

const context = demoLibBrowserContext({ ...demoLibSearchBootDevBrowserConfig, window, fetch, pkgName: demoLibSearchPkgName })

ReactDOM.render(
  <DemoSearch id={demoLibSearchPkgName} location={context.location} fetch={context.fetch} />,
  context.container
)
