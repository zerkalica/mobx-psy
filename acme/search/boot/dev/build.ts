import '@snap/server/polyfill'

import { PsySsrTemplate } from '@psy/core/ssr/Template'
import { SnapBuildBundler } from '@snap/build/bundler'

import { acmeSearchPkgName } from '../../pkgName'
import { acmeSearchBootDevBrowserConfig } from './browserConfig'

new SnapBuildBundler({
  publicUrl: acmeSearchBootDevBrowserConfig.publicUrl,
  distRoot: __dirname,
  pkgName: acmeSearchPkgName,
  template: new PsySsrTemplate(),
  isDev: true,
}).bundle()
