import '@snap/server/polyfill'

import { snapBuildBundler } from '@snap/build/bundler'

import { acmeSearchPkgName } from '../../pkgName'
import { acmeSearchBootProdBrowserConfig } from './browserConfig'

const distRoot = __dirname

snapBuildBundler({
  publicUrl: acmeSearchBootProdBrowserConfig.publicUrl,
  pkgName: acmeSearchPkgName,
  distRoot,
}).bundle()
