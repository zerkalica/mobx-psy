import { mySearchBootCommonBrowserConfig } from './browserConfig'

export const mySearchBootCommonServerConfig = {
  ...mySearchBootCommonBrowserConfig,
  port: 9080,
  apiUrl: '/',
  title: 'Search flats INC'
}
