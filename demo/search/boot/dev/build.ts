import '@demo/lib-server/polyfill'

import { promises as fs } from 'fs'

import { demoLibBuildBundler, demoLibBuildContext } from '@demo/lib-build'
import { DemoLibServerIndexHtml } from '@demo/lib-server'

import { demoSearchPkgName } from '../../pkgName'
import { demoSearchBootCommonServerConfig } from '../common/serverConfig'
import { demoSearchBootDevBrowserConfig } from './browserConfig'

const distRoot = __dirname

const context = demoLibBuildContext({
  distRoot,
})

const html = new DemoLibServerIndexHtml({
  ...demoSearchBootCommonServerConfig,
  pkgName: demoSearchPkgName,
})

demoLibBuildBundler({
  ...demoSearchBootDevBrowserConfig,
  minify: false,
  //scopeHoist: true,
  watch: false,
  distRoot,
})
  .bundle()
  .then(() => fs.writeFile(context.indexHtml, `${html}`))
