import express from 'express'

import { usePsyContextNode } from '@psy/core/context/provide.node'
import { psySsrRenderMiddleware } from '@psy/react/ssr/renderMiddleware.node'

import { SnapServerManifest } from '../Manifest'
import { snapServerMdlError } from './error'

export function snapServerMdlExpress(p: {
  app?: Parameters<typeof psySsrRenderMiddleware>[0]
  port: number
  init: (e: express.Express) => express.Express
}) {
  let srv = express()

  srv = p.init(srv)
  srv.get('/version', (req, res) => {
    const $ = usePsyContextNode()
    const manifest = $.get(SnapServerManifest)
    res.send(manifest.version)
  })

  if (p.app) srv = srv.use(psySsrRenderMiddleware(p.app))

  srv.use(snapServerMdlError).listen(p.port, () => {
    console.log(
      `Server listening on \x1b[42m\x1b[1mhttp://localhost:${p.port}\x1b[0m in \x1b[41m${process.env.NODE_ENV}\x1b[0m 🌎...`
    )
  })
}
