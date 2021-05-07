import '@demo/lib-ui/polyfill'

import { PsyContextRegistry } from '@psy/context/Registry'

import { demoSearchBootCommonBrowser } from '../common/browser'
import { demoSearchBootDevBrowserConfig } from './browserConfig'
import { demoSearchBootDevMocks } from './mocks'

const fetcher = demoSearchBootDevMocks({
  errorRate: 0.9,
  timeout: 500,
})

demoSearchBootCommonBrowser(PsyContextRegistry.root, window, demoSearchBootDevBrowserConfig)
