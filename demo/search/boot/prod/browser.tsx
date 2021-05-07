import '@demo/lib-ui/polyfill'

import { PsyContextRegistry } from '@psy/context/Registry'

import { demoSearchBootCommonBrowser } from '../common/browser'
import { demoSearchBootProdBrowserConfig } from './browserConfig'

demoSearchBootCommonBrowser(PsyContextRegistry.root, window, demoSearchBootProdBrowserConfig)
