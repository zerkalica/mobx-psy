import '@snap/server/polyfill'

import { SnapBuildBundler } from '@snap/build/bundler'

import { acmeSearchPkgName } from '../../pkgName'
import { acmeSearchBootProdBrowserConfig } from './browserConfig'

new SnapBuildBundler({
  publicUrl: acmeSearchBootProdBrowserConfig.publicUrl,
  distRoot: __dirname,
  pkgName: acmeSearchPkgName,
}).bundle()
