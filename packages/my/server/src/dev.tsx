import express from 'express'
import { myBuildBundler } from '@my/build'

import { myServerContextMiddleware } from './contextMiddleware'
import { myServerErrorMiddleware } from './errorMiddleware'
import { myServerOnListen } from './onListen'
import { myServerRenderMiddleware } from './renderMiddleware'

export function myServerDev({
  distRoot,
  publicUrl,
  port,
  apiUrl,
  fetch,
  ...options
}: Parameters<typeof myServerContextMiddleware>[0] &
  Parameters<typeof myServerRenderMiddleware>[0] &
  Parameters<typeof myBuildBundler>[0] & {
    port: number
  }) {
  const bundler = myBuildBundler({
    publicUrl,
    minify: false,
    distRoot,
    watch: true,
  })

  express()
    .use(bundler.middleware())
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
