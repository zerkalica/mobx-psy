import express from 'express'

import { demoLibBuildBundler } from '@demo/lib-build/bundler'

import { demoLibServerContextMiddleware } from './contextMiddleware'
import { demoLibServerErrorMiddleware } from './errorMiddleware'
import { demoLibServerOnListen } from './onListen'
import { demoLibServerRenderMiddleware } from './renderMiddleware'

export function demoLibServerDev({
  distRoot,
  publicUrl,
  port,
  apiUrl,
  fetch,
  ...options
}: Parameters<typeof demoLibServerContextMiddleware>[0] &
  Parameters<typeof demoLibServerRenderMiddleware>[0] &
  Parameters<typeof demoLibBuildBundler>[0] & {
    port: number
  }) {
  const bundler = demoLibBuildBundler({
    publicUrl,
    minify: false,
    distRoot,
    watch: true,
  })

  express()
    .use(bundler.middleware())
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
