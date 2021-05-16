import '@snap/server/polyfill'

import { promises as fs } from 'fs'

import { snapBuildBundler } from '@snap/build/bundler'
import { snapBuildContext } from '@snap/build/context'
import { SnapServerIndexHtml } from '@snap/server/IndexHtml'

import { acmeSearchPkgName } from '../../pkgName'
import { acmeSearchBootCommonServerConfig } from '../common/serverConfig'
import { acmeSearchBootDevBrowserConfig } from './browserConfig'

const distRoot = __dirname

const { indexHtml } = snapBuildContext({
  distRoot,
})

const html = new SnapServerIndexHtml({
  ...acmeSearchBootCommonServerConfig,
  pkgName: acmeSearchPkgName,
})

snapBuildBundler({
  ...acmeSearchBootDevBrowserConfig,
  minify: false,
  //scopeHoist: true,
  distRoot,
})
  .bundle()
  .then(() => fs.writeFile(indexHtml, `${html}`))
