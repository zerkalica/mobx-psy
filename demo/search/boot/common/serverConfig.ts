import { demoSearchBootCommonBrowserConfig } from './browserConfig'
import { demoSearchPkgName } from '../../pkgName'

export const demoSearchBootCommonServerConfig = {
  ...demoSearchBootCommonBrowserConfig,
  pkgName: demoSearchPkgName,
  port: 9080,
  apiUrl: '/',
  title: 'Search flats INC'
}
