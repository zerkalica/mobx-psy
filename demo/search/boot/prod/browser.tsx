import '@demo/lib-browser-polyfill'

import React from 'react'
import ReactDOM from 'react-dom'

import { demoLibBrowserContext } from '@demo/lib-browser'

import { DemoSearch, demoLibSearchPkgName } from '../..'
import { demoLibSearchBootProdBrowserConfig } from './browserConfig'

const context = demoLibBrowserContext({
  ...demoLibSearchBootProdBrowserConfig,
  window,
  fetch: window.fetch,
  pkgName: demoLibSearchPkgName,
})

ReactDOM.render(
  <DemoSearch id={demoLibSearchPkgName} location={context.location} fetch={context.fetch} />,
  context.container
)
