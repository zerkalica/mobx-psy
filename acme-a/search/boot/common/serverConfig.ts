import { acmeSearchPkgName } from '../../pkgName'
import { acmeSearchBootCommonBrowserConfig } from './browserConfig'

export const acmeSearchBootCommonServerConfig = {
  ...acmeSearchBootCommonBrowserConfig,
  pkgName: acmeSearchPkgName,
  port: 9080,
  apiUrl: '/',
  title: 'Search flats INC',
}
