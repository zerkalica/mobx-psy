import '@demo/lib-server/polyfill'

import { demoSearchBootCommonServer } from '../common/server'
import { demoSearchBootDevBrowserConfig } from './browserConfig'
import { demoSearchBootDevMocks } from './mocks'
import { demoSearchBootDevServerConfig } from './serverConfig'

const fetcher = demoSearchBootDevMocks({
  errorRate: 1,
  timeout: 100,
})

demoSearchBootCommonServer({
  serverConfig: demoSearchBootDevServerConfig,
  browserConfig: demoSearchBootDevBrowserConfig,
  distRoot: __dirname,
  fetcher,
  isDev: true,
})
