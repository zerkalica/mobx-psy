import 'source-map-support/register'
import '../common/polyfills'

import express from 'express'
import { FetchLike } from 'mobx-psy'
import fetch from 'node-fetch'

import {
  bundleRoot,
  port,
  publicUrl,
  reactMiddleware,
} from '../common/reactMiddleware'

express()
  .use(express.static(bundleRoot, { index: false }))
  .use(reactMiddleware({ fetch: fetch as FetchLike, publicUrl, apiUrl: '/' }))
  .listen(port, () => {
    console.log(
      `Server listening on \x1b[42m\x1b[1mhttp://localhost:${port}\x1b[0m in \x1b[41m${process.env.NODE_ENV}\x1b[0m 🌎...`
    )
  })
