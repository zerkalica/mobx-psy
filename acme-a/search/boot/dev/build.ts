import '@acme/server/polyfill'

import { AcmeBuildBundler } from '@acme/build/bundler'
import { PsySsrTemplate } from '@psy/psy/ssr/Template'

import { acmeSearchPkgName } from '../../pkgName'
import { acmeSearchBootDevBrowserConfig } from './browserConfig'

new AcmeBuildBundler({
  publicUrl: acmeSearchBootDevBrowserConfig.publicUrl,
  distRoot: __dirname,
  pkgName: acmeSearchPkgName,
  template: new PsySsrTemplate(),
  isDev: true,
}).bundle()
