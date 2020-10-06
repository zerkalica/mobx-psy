import '@demo/lib-browser/polyfill.js'

import React from 'react'
import ReactDOM from 'react-dom'

import { demoLibBrowserContext } from '@demo/lib-browser/context.js'

import { demoSearchPkgName } from '../../pkgName'
import { DemoSearch } from '../../search'
import { demoSearchBootDevBrowserConfig } from './browserConfig'
import { demoSearchBootDevMocks } from './mocks'

const fetch = demoSearchBootDevMocks({
  errorRate: 0.9,
  timeout: 500,
})

const context = demoLibBrowserContext({
  ...demoSearchBootDevBrowserConfig,
  window,
  fetch,
  pkgName: demoSearchPkgName,
})

ReactDOM.render(
  <DemoSearch id={demoSearchPkgName} location={context.location} fetch={context.fetch} />,
  context.container
)
