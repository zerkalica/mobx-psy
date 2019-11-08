import { browserConfig } from './browserConfig'
import { createBundler } from '../common/createBundler'

const distRoot = __dirname

createBundler({
  ...browserConfig,
  minify: true,
  //scopeHoist: true,
  watch: false,
  distRoot,
}).bundle()
