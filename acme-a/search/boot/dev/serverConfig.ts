import { acmeSearchBootCommonServerConfig } from '../common/serverConfig'

export const acmeSearchBootDevServerConfig: typeof acmeSearchBootCommonServerConfig = {
  ...acmeSearchBootCommonServerConfig,
  port: 9080,
  apiUrl: '/',
  title: 'Search flats INC',
}
