import '@demo/lib-server/polyfill'

import express from 'express'
import path from 'path'
import React from 'react'

import { demoLibBuildBundler } from '@demo/lib-build/bundler'
import { demoLibRouterClient } from '@demo/lib-router/client'
import { DemoLibRouterLocation } from '@demo/lib-router/location'
import { DemoLibServerIndexHtml } from '@demo/lib-server/IndexHtml'
import { demoLibServerMdlExpress } from '@demo/lib-server/mdl/express'
import { demoLibServerMdlRender } from '@demo/lib-server/mdl/render'
import { psyContextProvideNode } from '@psy/context/node'
import { Fetcher } from '@psy/ssr/Fetcher'
import { FetcherServer } from '@psy/ssr/FetcherServer'
import { Hydrator, HydratorServer } from '@psy/ssr/Hydrator'
import { locationFromNodeRequest } from '@psy/ssr/locationFromNodeRequest'

import { demoSearchPkgName } from '../../pkgName'
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
        .use((req, res, next) => {
          psyContextProvideNode(next, $ =>
            $.set(Hydrator, new HydratorServer({ __config: browserConfig }))
              .set(demoSearchBootCommonServerConfig, serverConfig)
              .set(demoLibRouterClient, {
                ...$.v(demoLibRouterClient),
                location: locationFromNodeRequest(req, req.secure),
              })
              .set(DemoLibRouterLocation, new DemoLibRouterLocation($))
              .set(Fetcher, new FetcherServer(serverConfig.apiUrl))
          )
        })
        .use(staticMiddleware)
        .use(
          demoLibServerMdlRender({
            template: new DemoLibServerIndexHtml({ ...serverConfig }),
            app: () => <DemoSearch id={demoSearchPkgName} />,
          })
        ),
  })
}
