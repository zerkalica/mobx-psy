import '@demo/lib-browser/polyfill'

import React from 'react'
import ReactDOM from 'react-dom'

import { demoLibBrowserContext } from '@demo/lib-browser/context'

import { DemoSearch } from '../../search'
import { demoSearchPkgName } from '../../pkgName'
import { demoSearchBootProdBrowserConfig } from './browserConfig'

const context = demoLibBrowserContext({
  ...demoSearchBootProdBrowserConfig,
  window,
  fetch: window.fetch,
  pkgName: demoSearchPkgName,
})

ReactDOM.render(
  <DemoSearch id={demoSearchPkgName} location={context.location} fetch={context.fetch} />,
  context.container
)
