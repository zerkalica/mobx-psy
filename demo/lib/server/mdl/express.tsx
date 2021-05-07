import express from 'express'

import { demoLibServerMdlError } from './error'

export function demoLibServerMdlExpress(p: { port: number; init: (e: express.Express) => express.Express }) {
  let srv = express()

  srv = p.init(srv)

  srv.use(demoLibServerMdlError).listen(p.port, () => {
    console.log(`Server listening on \x1b[42m\x1b[1mhttp://localhost:${p.port}\x1b[0m in \x1b[41m${process.env.NODE_ENV}\x1b[0m 🌎...`)
  })
}
