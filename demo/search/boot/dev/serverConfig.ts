import { demoSearchBootCommonServerConfig } from '../common/serverConfig'

export const demoSearchBootDevServerConfig: typeof demoSearchBootCommonServerConfig = {
  ...demoSearchBootCommonServerConfig,
  port: 9080,
  apiUrl: '/',
  title: 'Search flats INC'
}
