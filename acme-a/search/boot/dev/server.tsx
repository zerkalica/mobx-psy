import '@acme/server/polyfillDev'

import { AcmeSearchBootServer } from '../server'
import { acmeSearchBootDevConfig } from './config'
import { acmeSearchBootDevMocks } from './mocks'

const fetcher = acmeSearchBootDevMocks({
  errorRate: 1,
  timeout: 100,
})

const srv = new AcmeSearchBootServer()
srv.isDev = () => true
srv.fallbackConfig = () => acmeSearchBootDevConfig
srv.fetcher = () => fetcher

srv.start()
