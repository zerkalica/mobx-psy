import { acmeSearchBootConfig } from '../../boot/config'
import { acmeSearchBootProdConfigBrowser } from './configBrowser'

export const acmeSearchBootProdConfig: typeof acmeSearchBootConfig = {
  ...acmeSearchBootConfig,
  browser: acmeSearchBootProdConfigBrowser,
  port: 9080,
  apiUrl: '/',
}
