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
import { psyContextProvideNode } from '@psy/core/context/provide.node'
import { PsyFetcher } from '@psy/core/fetcher/Fetcher'
import { PsyFetcherNode } from '@psy/core/fetcher/Fetcher.node'
import { PsySsrHydrator } from '@psy/core/ssr/Hydrator'
import { PsySsrHydratorNode } from '@psy/core/ssr/Hydrator.node'
import { psySsrLocationNode } from '@psy/core/ssr/location.node'

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
            $.set(PsySsrHydrator.instance, new PsySsrHydratorNode({ __config: browserConfig }))
              .set(demoSearchBootCommonServerConfig, serverConfig)
              .set(demoLibRouterClient, {
                ...$.v(demoLibRouterClient),
                location: psySsrLocationNode(req, req.secure),
              })
              .set(DemoLibRouterLocation.instance, new DemoLibRouterLocation($))
              .set(
                PsyFetcher,
                class PsyFetcherNodeReq extends PsyFetcherNode {
                  static baseUrl = serverConfig.apiUrl
                }
              )
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
