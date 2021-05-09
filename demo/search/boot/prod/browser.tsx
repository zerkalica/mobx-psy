import '@demo/lib-ui/polyfill'

import { PsyContext } from '@psy/core/context/Context'

import { demoSearchBootCommonBrowser } from '../common/browser'
import { demoSearchBootProdBrowserConfig } from './browserConfig'

demoSearchBootCommonBrowser(PsyContext.instance, window, demoSearchBootProdBrowserConfig)
