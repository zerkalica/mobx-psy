import '../common/envDev'
import '../common/polyfills'

import express from 'express'
import Bundler from 'parcel-bundler'
import path from 'path'

import { createFetch } from '../common/mocks'
import { reactMiddleware } from '../common/reactMiddleware'
import { bundleRoot, port, publicUrl } from '../common/variables'

const fetch = createFetch({
  errorRate: 1,
  timeout: 100,
})

const bundlerBrowser = new Bundler(
  path.join(process.cwd(), 'src', 'app', 'dev', 'browser.ts'),
  {
    outDir: bundleRoot,
    publicUrl,
    contentHash: false,
  }
)

express()
  .use(bundlerBrowser.middleware())
  .use(reactMiddleware({ fetch, publicUrl }))
  .listen(port, () => {
    console.log(
      `Server listening on \x1b[42m\x1b[1mhttp://localhost:${port}\x1b[0m in \x1b[41m${process.env.NODE_ENV}\x1b[0m 🌎...`
    )
  })
