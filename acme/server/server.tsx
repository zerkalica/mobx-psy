import '@acme/server/polyfill'

import express from 'express'
import nodeFetch from 'node-fetch'
import path from 'path'

import { acmeServerMdlContext } from './mdl/context'
import { acmeServerMdlError } from './mdl/error'
import { acmeServerMdlListen } from './mdl/listen'
import { acmeServerMdlVersion } from './mdl/version'

export function acmeServer({
  distRoot = __dirname,
  outDir = path.join(distRoot, 'public'),
  top = e => e,
  bottom = e => e,
  serverConfig,
  browserConfig,
  fetcher = nodeFetch as unknown as typeof fetch,
}: Parameters<typeof acmeServerMdlContext>[0] & {
  serverConfig: Parameters<typeof acmeServerMdlListen>[0]
  top?(e: express.Express): express.Express
  bottom?(e: express.Express): express.Express
}) {
  let srv = express()
  srv = top(srv)

  srv = srv
    .use(acmeServerMdlContext({ outDir, browserConfig, serverConfig, fetcher }))
    .get('/version', acmeServerMdlVersion)
    .get('/favicon.ico', (req, res) => res.status(200).end())

  srv = bottom(srv)

  srv.use(acmeServerMdlError).listen(serverConfig.port, acmeServerMdlListen(serverConfig))
}
