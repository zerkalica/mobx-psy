import '@acme/browser/polyfill'

import { AcmeSearchBootBrowser } from '../browser'
import { acmeSearchBootDevConfigBrowser } from './configBrowser'
import { acmeSearchBootDevMocks } from './mocks'

const fetcher = acmeSearchBootDevMocks({
  errorRate: 0.9,
  timeout: 500,
})

const browser = new AcmeSearchBootBrowser()
browser.fetcher = () => fetcher
browser.fallbackConfig = () => acmeSearchBootDevConfigBrowser

browser.start()
