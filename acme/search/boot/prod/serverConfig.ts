import { acmeSearchBootCommonServerConfig } from '../common/serverConfig'

export const acmeSearchBootProdServerConfig: typeof acmeSearchBootCommonServerConfig = {
  ...acmeSearchBootCommonServerConfig,
  port: 9080,
  apiUrl: '/',
  title: 'Search flats INC',
}
