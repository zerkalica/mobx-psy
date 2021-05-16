import '@snap/server/polyfill'

import { snapBuildBundler } from '@snap/build/bundler'

import { acmeSearchBootProdBrowserConfig } from './browserConfig'

const distRoot = __dirname

snapBuildBundler({
  ...acmeSearchBootProdBrowserConfig,
  minify: true,
  //scopeHoist: true,
  distRoot,
}).bundle()
