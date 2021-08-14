import '@acme/server/polyfill'

import { acmeSearchBootCommonServer } from '../common/server'
import { acmeSearchBootProdBrowserConfig } from './browserConfig'
import { acmeSearchBootProdServerConfig } from './serverConfig'

acmeSearchBootCommonServer({
  serverConfig: acmeSearchBootProdServerConfig,
  browserConfig: acmeSearchBootProdBrowserConfig,
  distRoot: __dirname,
})
