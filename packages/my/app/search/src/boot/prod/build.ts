import '@my/server-polyfill'

import { myBuildBundler } from '@my/build'

import { mySearchBootProdBrowserConfig } from './browserConfig'

const distRoot = __dirname

myBuildBundler({
  ...mySearchBootProdBrowserConfig,
  minify: true,
  //scopeHoist: true,
  watch: false,
  distRoot,
}).bundle()
