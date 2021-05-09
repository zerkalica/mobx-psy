import '@demo/lib-ui/polyfill'

import { demoSearchBootCommonBrowser } from '../common/browser'
import { demoSearchBootDevBrowserConfig } from './browserConfig'
import { demoSearchBootDevMocks } from './mocks'

const fetcher = demoSearchBootDevMocks({
  errorRate: 0.9,
  timeout: 500,
})

demoSearchBootCommonBrowser(undefined, window, demoSearchBootDevBrowserConfig)
