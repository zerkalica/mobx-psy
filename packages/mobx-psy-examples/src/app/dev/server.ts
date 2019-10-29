import '../common/polyfills'

import express from 'express'
import Bundler from 'parcel-bundler'
import path from 'path'

// @ts-ignore
//import ttsPlugin from 'parcel-plugin-ttypescript'

import { createFetch } from '../common/mocks'
import {
  bundleRoot,
  port,
  publicUrl,
  reactMiddleware,
} from '../common/reactMiddleware'

const fetch = createFetch({
  errorRate: 1,
  timeout: 100,
})

const entryPoint = path.join(__dirname, 'browser.ts')

const bundler = new Bundler(entryPoint, {
  outDir: bundleRoot,
  publicUrl,
  contentHash: false,
})

//ttsPlugin(bundler)

express()
  .use(bundler.middleware())
  .use(reactMiddleware({ fetch, publicUrl }))
  .listen(port, () => {
    console.log(
      `Server listening on \x1b[42m\x1b[1mhttp://localhost:${port}\x1b[0m in \x1b[41m${process.env.NODE_ENV}\x1b[0m 🌎...`
    )
  })
