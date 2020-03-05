import '@my/browser-polyfill'

import React from 'react'
import ReactDOM from 'react-dom'

import { myBrowserContext } from '@my/browser'

import { MySearch, mySearchPkgName } from '../..'
import { mySearchBootProdBrowserConfig } from './browserConfig'

const context = myBrowserContext({
  ...mySearchBootProdBrowserConfig,
  window,
  fetch: window.fetch,
  pkgName: mySearchPkgName,
})

ReactDOM.render(
  <MySearch id={mySearchPkgName} location={context.location} fetch={context.fetch} />,
  context.container
)
