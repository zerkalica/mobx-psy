import '@demo/lib-server-polyfill'

import { promises as fs } from 'fs'

import { demoLibBuildBundler, demoLibBuildContext } from '@demo/lib-build'
import { DemoLibServerIndexHtml } from '@demo/lib-server'

import { demoLibSearchPkgName } from '../../pkgName'
import { demoLibSearchBootCommonServerConfig } from '../common/serverConfig'
import { demoLibSearchBootDevBrowserConfig } from './browserConfig'

const distRoot = __dirname

const context = demoLibBuildContext({
  distRoot,
})

const html = new DemoLibServerIndexHtml({
  ...demoLibSearchBootCommonServerConfig,
  pkgName: demoLibSearchPkgName,
})

demoLibBuildBundler({
  ...demoLibSearchBootDevBrowserConfig,
  minify: false,
  //scopeHoist: true,
  watch: false,
  distRoot,
})
  .bundle()
  .then(() => fs.writeFile(context.indexHtml, `${html}`))
