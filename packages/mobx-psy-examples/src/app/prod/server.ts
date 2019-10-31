import { createProdServer } from '../common/createProdServer'
import { browserConfig } from './browserConfig'
import { serverConfig } from './serverConfig'

const distRoot = __dirname

createProdServer({...serverConfig, publicUrl: browserConfig.publicUrl, distRoot})
