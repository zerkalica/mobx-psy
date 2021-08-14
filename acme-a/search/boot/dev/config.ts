import { acmeSearchBootConfig } from '../../boot/config'
import { acmeSearchBootDevConfigBrowser } from './configBrowser'

export const acmeSearchBootDevConfig: typeof acmeSearchBootConfig = {
  ...acmeSearchBootConfig,
  browser: acmeSearchBootDevConfigBrowser,
  port: 9080,
  apiUrl: '/',
  title: 'Search flats INC',
}
