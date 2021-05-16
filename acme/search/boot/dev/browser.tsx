import '@snap/ui/polyfill'

import { acmeSearchBootCommonBrowser } from '../common/browser'
import { acmeSearchBootDevBrowserConfig } from './browserConfig'
import { acmeSearchBootDevMocks } from './mocks'

const fetcher = acmeSearchBootDevMocks({
  errorRate: 0.9,
  timeout: 500,
})

acmeSearchBootCommonBrowser({ fetchFn: fetcher, fallbackConfig: acmeSearchBootDevBrowserConfig })
