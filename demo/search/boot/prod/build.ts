import '@demo/lib-server-polyfill'

import { demoLibBuildBundler } from '@demo/lib-build'

import { demoLibSearchBootProdBrowserConfig } from './browserConfig'

const distRoot = __dirname

demoLibBuildBundler({
  ...demoLibSearchBootProdBrowserConfig,
  minify: true,
  //scopeHoist: true,
  watch: false,
  distRoot,
}).bundle()
