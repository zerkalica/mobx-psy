import '@acme/server/polyfill'

import { AcmeBuildBundler } from '@acme/build/bundler'

import { acmeSearchPkgName } from '../../pkgName'
import { acmeSearchBootCommonServer } from '../common/server'
import { acmeSearchBootDevBrowserConfig } from './browserConfig'
import { acmeSearchBootDevMocks } from './mocks'
import { acmeSearchBootDevServerConfig } from './serverConfig'

const fetcher = acmeSearchBootDevMocks({
  errorRate: 1,
  timeout: 100,
})

const bundler = new AcmeBuildBundler({
  publicUrl: acmeSearchBootDevServerConfig.publicUrl,
  pkgName: acmeSearchPkgName,
  distRoot: __dirname,
})

acmeSearchBootCommonServer({
  serverConfig: acmeSearchBootDevServerConfig,
  browserConfig: acmeSearchBootDevBrowserConfig,
  bundlerMdl: bundler.middleware(),
  outDir: bundler.outDir,
  fetcher,
})
