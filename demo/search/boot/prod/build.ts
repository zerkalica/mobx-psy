import '@demo/lib-server/polyfill'

import { demoLibBuildBundler } from '@demo/lib-build/bundler'

import { demoSearchBootProdBrowserConfig } from './browserConfig'

const distRoot = __dirname

demoLibBuildBundler({
  ...demoSearchBootProdBrowserConfig,
  minify: true,
  //scopeHoist: true,
  watch: false,
  distRoot,
}).bundle()
