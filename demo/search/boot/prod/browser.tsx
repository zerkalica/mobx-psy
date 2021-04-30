import '@demo/lib-browser/polyfill'

import { demoSearchBootCommonBrowser } from '../common/browser'
import { demoSearchBootProdBrowserConfig } from './browserConfig'

demoSearchBootCommonBrowser({
  browserConfig: demoSearchBootProdBrowserConfig
})
