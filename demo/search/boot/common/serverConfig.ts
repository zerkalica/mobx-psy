import { demoLibSearchBootCommonBrowserConfig } from './browserConfig'

export const demoLibSearchBootCommonServerConfig = {
  ...demoLibSearchBootCommonBrowserConfig,
  port: 9080,
  apiUrl: '/',
  title: 'Search flats INC'
}
