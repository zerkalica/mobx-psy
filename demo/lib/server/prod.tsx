import express from 'express'
import path from 'path'

import { demoLibServerContextMiddleware } from './contextMiddleware'
import { demoLibServerErrorMiddleware } from './errorMiddleware'
import { demoLibServerOnListen } from './onListen'
import { demoLibServerRenderMiddleware } from './renderMiddleware'

export function demoLibServerProd({
  distRoot,
  publicUrl,
  port,
  apiUrl,
  fetch,
  ...options
}: Parameters<typeof demoLibServerContextMiddleware>[0] &
  Parameters<typeof demoLibServerRenderMiddleware>[0] & {
    port: number
    distRoot: string
  }) {
  express()
    .use(express.static(path.join(distRoot, 'public'), { index: false }))
    .use(demoLibServerContextMiddleware({ fetch, apiUrl }))
    .use(
      demoLibServerRenderMiddleware({
        ...options,
        publicUrl,
      })
    )
    .use(demoLibServerErrorMiddleware())
    .listen(port, demoLibServerOnListen({ port, env: process.env.NODE_ENV }))
}
