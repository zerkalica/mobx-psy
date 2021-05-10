import '@demo/lib-ui/polyfill'

import { demoSearchBootCommonBrowser } from '../common/browser'
import { demoSearchBootProdBrowserConfig } from './browserConfig'

demoSearchBootCommonBrowser({ fallbackConfig: demoSearchBootProdBrowserConfig })
