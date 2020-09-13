import { demoSearchBootCommonBrowserConfig } from './browserConfig'

export const demoSearchBootCommonServerConfig = {
  ...demoSearchBootCommonBrowserConfig,
  port: 9080,
  apiUrl: '/',
  title: 'Search flats INC'
}
