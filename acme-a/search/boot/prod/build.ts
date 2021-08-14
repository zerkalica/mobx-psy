import '@acme/server/polyfill'

import { AcmeSearchBootBuild } from '../build'
import { acmeSearchBootProdConfig } from './config'

const bundler = new AcmeSearchBootBuild()
bundler.publicUrl = () => acmeSearchBootProdConfig.browser.publicUrl
bundler.distRoot = () => __dirname

bundler.bundle()
