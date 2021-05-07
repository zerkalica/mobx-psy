import { demoSearchPkgName } from '../../pkgName'
import { demoSearchBootCommonBrowserConfig } from './browserConfig'

export const demoSearchBootCommonServerConfig = {
  ...demoSearchBootCommonBrowserConfig,
  pkgName: demoSearchPkgName,
  port: 9080,
  apiUrl: '/',
  title: 'Search flats INC',
}
