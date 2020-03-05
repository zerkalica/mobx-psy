import '@my/server-polyfill'

import { promises as fs } from 'fs'

import { myBuildBundler, myBuildContext } from '@my/build'
import { MyServerIndexHtml } from '@my/server'

import { mySearchPkgName } from '../../pkgName'
import { mySearchBootCommonServerConfig } from '../common/serverConfig'
import { mySearchBootDevBrowserConfig } from './browserConfig'

const distRoot = __dirname

const context = myBuildContext({
  distRoot,
})

const html = new MyServerIndexHtml({
  ...mySearchBootCommonServerConfig,
  pkgName: mySearchPkgName,
})

myBuildBundler({
  ...mySearchBootDevBrowserConfig,
  minify: false,
  //scopeHoist: true,
  watch: false,
  distRoot,
})
  .bundle()
  .then(() => fs.writeFile(context.indexHtml, `${html}`))
