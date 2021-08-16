import '@acme/browser/polyfill'

import { AcmeSearchBootBrowser } from '../browser'
import { acmeSearchBootProdConfigBrowser } from './configBrowser'

const browser = new AcmeSearchBootBrowser()
browser.fallbackConfig = () => acmeSearchBootProdConfigBrowser

browser.start()
