import express from 'express'

import { psyContextInit } from '@psy/context/context.node'
import { psyContextCreate } from '@psy/context/create'
import { ServerFetcher } from '@psy/mobx-ssr/ServerFetcher'

import { demoLibServerMdlError } from './error'

export const DemoLibServerMdlExpressContext = psyContextCreate<{
  fetcher: ServerFetcher
  pkgName: string
  publicUrl: string
  browserConfig?: Object
}>('DemoLibServerMdlConfigContext')

export function demoLibServerMdlExpress(p: { port: number; init: (e: express.Express) => express.Express }) {
  let srv = express()

  srv.use((req, res, next) => {
    psyContextInit(() => {
      next()
    })
  })

  srv = p.init(srv)

  srv.use(demoLibServerMdlError).listen(p.port, () => {
    console.log(`Server listening on \x1b[42m\x1b[1mhttp://localhost:${p.port}\x1b[0m in \x1b[41m${process.env.NODE_ENV}\x1b[0m 🌎...`)
  })
}
