import 'mobx-psy-scripts/envDev'
import '../common/polyfills'
import { browserConfig } from './browserConfig'
import { serverConfig } from './serverConfig'
import { createDevServer } from '../common/createDevServer'
import { createFetch } from '../common/mocks'

const distRoot = __dirname

const fetch = createFetch({
  errorRate: 1,
  timeout: 100,
})

createDevServer({ ...serverConfig, fetch, publicUrl: browserConfig.publicUrl, distRoot })
