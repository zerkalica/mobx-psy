import '@snap/server/polyfill'

import { acmeSearchBootCommonServer } from '../common/server'
import { acmeSearchBootDevBrowserConfig } from './browserConfig'
import { acmeSearchBootDevMocks } from './mocks'
import { acmeSearchBootDevServerConfig } from './serverConfig'

const fetcher = acmeSearchBootDevMocks({
  errorRate: 1,
  timeout: 100,
})
acmeSearchBootCommonServer({
  serverConfig: acmeSearchBootDevServerConfig,
  browserConfig: acmeSearchBootDevBrowserConfig,
  distRoot: __dirname,
  fetcher,
  isDev: true,
  noWatch: process.env.PSY_NO_WATCH === '1',
})
