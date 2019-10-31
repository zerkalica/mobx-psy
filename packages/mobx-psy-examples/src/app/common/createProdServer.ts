import 'mobx-psy-scripts/envProd'
import 'source-map-support/register'
import './polyfills'

import express from 'express'
import { FetchLike } from 'mobx-psy'
import fetch from 'node-fetch'
import path from 'path'

import { reactMiddleware } from './reactMiddleware'

export function createProdServer({
  publicUrl,
  apiUrl,
  port,
  distRoot,
}: {
  distRoot: string
  publicUrl: string
  apiUrl: string
  port: number
}) {
  express()
    .use(express.static(path.join(distRoot, 'public'), { index: false }))
    .use(
      reactMiddleware({
        fetch: fetch as FetchLike,
        publicUrl,
        apiUrl,
      })
    )
    .listen(port, () => {
      console.log(
        `Server listening on \x1b[42m\x1b[1mhttp://localhost:${port}\x1b[0m in \x1b[41m${process.env.NODE_ENV}\x1b[0m 🌎...`
      )
    })
}
