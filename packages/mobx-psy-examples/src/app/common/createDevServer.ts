import 'mobx-psy-scripts/envDev'
import './polyfills'

import express from 'express'

import { reactMiddleware } from './reactMiddleware'
import { createBundler } from './createBundler'
import { FetchLike } from 'mobx-psy'

export function createDevServer({
  distRoot,
  publicUrl,
  port,
  apiUrl,
  fetch
}: {
  fetch: FetchLike
  publicUrl: string
  port: number
  apiUrl: string
  distRoot: string
}) {
  const bundler = createBundler({
    publicUrl,
    minify: false,
    distRoot,
    watch: true,
  })

  express()
    .use(bundler.middleware())
    .use(reactMiddleware({ fetch, publicUrl, apiUrl }))
    .listen(port, () => {
      console.log(
        `Server listening on \x1b[42m\x1b[1mhttp://localhost:${port}\x1b[0m in \x1b[41m${process.env.NODE_ENV}\x1b[0m 🌎...`
      )
    })
}
