import '@snap/ui/polyfill'

import { acmeSearchBootCommonBrowser } from '../common/browser'
import { acmeSearchBootProdBrowserConfig } from './browserConfig'

acmeSearchBootCommonBrowser({ fallbackConfig: acmeSearchBootProdBrowserConfig })
