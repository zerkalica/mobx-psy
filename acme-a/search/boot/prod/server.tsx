import '@acme/server/polyfill'

import { AcmeSearchBootServer } from '../server'
import { acmeSearchBootProdConfig } from './config'

const srv = new AcmeSearchBootServer()
srv.fallbackConfig = () => acmeSearchBootProdConfig
srv.distRoot = () => __dirname

srv.start()
