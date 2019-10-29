import '../common/polyfills'

import Bundler from 'parcel-bundler'
import path from 'path'

import { bundleRoot, publicUrl } from '../common/variables'

const bundlerBrowser = new Bundler(path.join(__dirname, 'browser.ts'), {
  outDir: bundleRoot,
  publicUrl,
  contentHash: false,
})

const bundlerServer = new Bundler(path.join(__dirname, 'server.ts'), {
  outDir: bundleRoot,
  publicUrl,
  contentHash: false,
  target: 'node',
  bundleNodeModules: true,
})

bundlerBrowser
  .bundle()
  .then(() => bundlerServer.bundle())
  .then(() => {
    console.log(`Copy ${bundleRoot}/* to ${publicUrl} url`)
    process.exit(0)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
