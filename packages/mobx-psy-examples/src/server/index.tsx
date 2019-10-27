import express from 'express'

import { appServerMiddleware } from './appServerMiddleware'
import path from 'path'

const server = express()
const PORT = process.env.PORT || 8080

const bundle = path.join(__dirname, '..', 'bundle')
server.use(express.static(bundle, {index: false}))

server.use(appServerMiddleware({}))

server.listen(PORT, () => {
  console.log(
    `Server listening on \x1b[42m\x1b[1mhttp://localhost:${PORT}\x1b[0m in \x1b[41m${process.env.NODE_ENV}\x1b[0m 🌎...`
  )
})
