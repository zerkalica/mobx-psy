import '@demo/lib-server/polyfill'

import nodeFetch from 'node-fetch'

import { demoSearchBootCommonServer } from '../common/server'
import { demoSearchBootProdBrowserConfig } from './browserConfig'
import { demoSearchBootProdServerConfig } from './serverConfig'

demoSearchBootCommonServer({
  serverConfig: demoSearchBootProdServerConfig,
  browserConfig: demoSearchBootProdBrowserConfig,
  distRoot: __dirname,
  fetcher: (nodeFetch as unknown) as typeof fetch,
})
