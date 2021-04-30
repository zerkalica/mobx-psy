import '@demo/lib-server/polyfill'

import express from 'express'
import path from 'path'
import React from 'react'

import { demoLibBuildBundler } from '@demo/lib-build/bundler'
import { demoLibIOFetchWrap } from '@demo/lib-io/fetchWrap'
import { DemoLibIOContext } from '@demo/lib-io/io'
import { DemoLibRouterLocation } from '@demo/lib-router/location'
import { demoLibServerMdlAsync } from '@demo/lib-server/mdl/async'
import { demoLibServerMdlExpress, DemoLibServerMdlExpressContext } from '@demo/lib-server/mdl/express'
import { demoLibServerMdlRender } from '@demo/lib-server/mdl/render'
import { locationFromNodeRequest } from '@psy/mobx-ssr/locationFromNodeRequest'
import { ServerFetcher } from '@psy/mobx-ssr/ServerFetcher'

import { DemoSearch } from '../../search'
import { demoSearchBootCommonBrowserConfig } from './browserConfig'
import { demoSearchBootCommonServerConfig } from './serverConfig'

export function demoSearchBootCommonServer({
  distRoot,
  serverConfig,
  browserConfig,
  isDev,
  fetcher: fetchRaw,
}: {
  fetcher: typeof fetch
  isDev?: boolean
  serverConfig: typeof demoSearchBootCommonServerConfig
  browserConfig: typeof demoSearchBootCommonBrowserConfig
  distRoot: string
}) {
  const staticMiddleware = isDev
    ? demoLibBuildBundler({
        publicUrl: serverConfig.publicUrl,
        distRoot,
      }).middleware()
    : express.static(path.join(distRoot, 'public'), { index: false })

  demoLibServerMdlExpress({
    port: serverConfig.port,
    init: e =>
      e
        .use(
          demoLibServerMdlAsync(async req => {
            const config = serverConfig

            const fetchFn = demoLibIOFetchWrap({ fetchFn: fetchRaw, apiUrl: config.apiUrl })
            const fetcher = new ServerFetcher({ fetchFn })
            const location = new DemoLibRouterLocation(locationFromNodeRequest(req, req.secure))

            DemoLibIOContext.provide({ location, fetch: fetcher.fetch })
            DemoLibServerMdlExpressContext.provide({ fetcher, ...config, browserConfig })
          })
        )
        .use(staticMiddleware)
        .use(demoLibServerMdlRender(id => <DemoSearch id={id} />)),
  })
}
