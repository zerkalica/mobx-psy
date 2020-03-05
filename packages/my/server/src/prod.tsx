import express from 'express'
import path from 'path'

import { myServerContextMiddleware } from './contextMiddleware'
import { myServerErrorMiddleware } from './errorMiddleware'
import { myServerOnListen } from './onListen'
import { myServerRenderMiddleware } from './renderMiddleware'

export function myServerProd({
  distRoot,
  publicUrl,
  port,
  apiUrl,
  fetch,
  ...options
}: Parameters<typeof myServerContextMiddleware>[0] &
  Parameters<typeof myServerRenderMiddleware>[0] & {
    port: number
    distRoot: string
  }) {
  express()
    .use(express.static(path.join(distRoot, 'public'), { index: false }))
    .use(myServerContextMiddleware({ fetch, apiUrl }))
    .use(
      myServerRenderMiddleware({
        ...options,
        publicUrl,
      })
    )
    .use(myServerErrorMiddleware())
    .listen(port, myServerOnListen({ port, env: process.env.NODE_ENV }))
}
