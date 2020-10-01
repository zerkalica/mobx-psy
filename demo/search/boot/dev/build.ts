import '@demo/lib-server/polyfill'

import { promises as fs } from 'fs'

import { demoLibBuildContext } from '@demo/lib-build/context'
import { demoLibBuildBundler } from '@demo/lib-build/bundler'
import { DemoLibServerIndexHtml } from '@demo/lib-server/IndexHtml'

import { demoSearchPkgName } from '../../pkgName'
import { demoSearchBootCommonServerConfig } from '../common/serverConfig'
import { demoSearchBootDevBrowserConfig } from './browserConfig'

const distRoot = __dirname

const { indexHtml } = demoLibBuildContext({
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
  distRoot,
})
  .bundle()
  .then(() => fs.writeFile(indexHtml, `${html}`))
