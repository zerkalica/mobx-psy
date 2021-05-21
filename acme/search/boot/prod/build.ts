import '@snap/server/polyfill'

import { SnapBuildBundler } from '@snap/build/bundler'

import { acmeSearchPkgName } from '../../pkgName'
import { acmeSearchBootProdBrowserConfig } from './browserConfig'

const distRoot = __dirname

new SnapBuildBundler({
  publicUrl: acmeSearchBootProdBrowserConfig.publicUrl,
  pkgName: acmeSearchPkgName,
  distRoot,
}).bundle()
