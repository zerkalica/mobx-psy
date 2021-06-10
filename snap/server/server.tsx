import '@snap/server/polyfill'

import express from 'express'
import nodeFetch from 'node-fetch'
import path from 'path'

import { snapServerMdlContext } from './mdl/context'
import { snapServerMdlError } from './mdl/error'
import { snapServerMdlListen } from './mdl/listen'
import { snapServerMdlVersion } from './mdl/version'

export function snapServer({
  distRoot = __dirname,
  outDir = path.join(distRoot, 'public'),
  top = e => e,
  bottom = e => e,
  serverConfig,
  browserConfig,
  fetcher = nodeFetch as unknown as typeof fetch,
}: Parameters<typeof snapServerMdlContext>[0] & {
  serverConfig: Parameters<typeof snapServerMdlListen>[0]
  top?(e: express.Express): express.Express
  bottom?(e: express.Express): express.Express
}) {
  let srv = express()
  srv = top(srv)

  srv = srv
    .use(snapServerMdlContext({ outDir, browserConfig, serverConfig, fetcher }))
    .get('/version', snapServerMdlVersion)
    .get('/favicon.ico', (req, res) => res.status(200).end())

  srv = bottom(srv)

  srv.use(snapServerMdlError).listen(serverConfig.port, snapServerMdlListen(serverConfig))
}
