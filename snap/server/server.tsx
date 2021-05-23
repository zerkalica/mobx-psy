import '@snap/server/polyfill'

import express from 'express'
import nodeFetch from 'node-fetch'
import path from 'path'
import React from 'react'

import { snapServerMdlContext } from './mdl/context'
import { snapServerMdlError } from './mdl/error'
import { snapServerMdlListen } from './mdl/listen'
import { snapServerMdlVersion } from './mdl/version'

export function snapServer({
  distRoot = __dirname,
  outDir = path.join(distRoot, 'public'),
  top = () => {},
  bottom = () => {},
  serverConfig,
  browserConfig,
  fetcher = nodeFetch as unknown as typeof fetch,
}: Parameters<typeof snapServerMdlContext>[0] & {
  serverConfig: Parameters<typeof snapServerMdlListen>[0]
  top?(e: express.Express): unknown
  bottom?(e: express.Express): unknown
}) {
  const srv = express()
  top(srv)
  srv.use(snapServerMdlContext({ outDir, browserConfig, serverConfig, fetcher })).get('/version', snapServerMdlVersion)
  bottom(srv)

  srv.use(snapServerMdlError).listen(serverConfig.port, snapServerMdlListen(serverConfig))
}
