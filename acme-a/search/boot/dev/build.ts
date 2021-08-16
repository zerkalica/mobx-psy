import '@acme/server/polyfillDev'

import { AcmeSearchBootBuild } from '../build'
import { acmeSearchBootDevConfig } from './config'

const bundler = new AcmeSearchBootBuild()
bundler.publicUrl = () => acmeSearchBootDevConfig.browser.publicUrl
bundler.distRoot = () => __dirname
bundler.isDev = () => true

bundler.bundle()
