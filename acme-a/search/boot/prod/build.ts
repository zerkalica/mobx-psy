import '@acme/server/polyfill'

import { AcmeBuildBundler } from '@acme/build/bundler'

import { acmeSearchPkgName } from '../../pkgName'
import { acmeSearchBootProdBrowserConfig } from './browserConfig'

new AcmeBuildBundler({
  publicUrl: acmeSearchBootProdBrowserConfig.publicUrl,
  distRoot: __dirname,
  pkgName: acmeSearchPkgName,
}).bundle()
