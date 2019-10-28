import Bundler from 'parcel-bundler'
import path from 'path'

import { bundleRoot, publicUrl } from '../common/reactMiddleware'

const entryPoint = path.join(__dirname, 'browser.ts')
const bundler = new Bundler(entryPoint, {
  outDir: bundleRoot,
  publicUrl,
  contentHash: false,
})

bundler
  .bundle()
  .then(() => {
    console.log(`Copy ${bundleRoot}/* to ${publicUrl} url`)
    process.exit(0)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
