import '@demo/lib-server/polyfill'

import express from 'express'
import nodeFetch from 'node-fetch'
import path from 'path'
import React from 'react'

import { demoLibBuildBundler } from '@demo/lib-build/bundler'
import { demoLibRouterClient } from '@demo/lib-router/client'
import { DemoLibRouterLocation } from '@demo/lib-router/location'
import { DemoLibServerIndexHtml } from '@demo/lib-server/IndexHtml'
import { demoLibServerMdlExpress } from '@demo/lib-server/mdl/express'
import { psyContextProvideNode } from '@psy/core/context/provide.node'
import { PsyFetcher } from '@psy/core/fetcher/Fetcher'
import { PsyFetcherNode } from '@psy/core/fetcher/Fetcher.node'
import { PsySsrHydrator } from '@psy/core/ssr/Hydrator'
import { PsySsrHydratorNode } from '@psy/core/ssr/Hydrator.node'
import { psySsrLocationNode } from '@psy/core/ssr/location.node'
import { psySsrRenderMiddleware } from '@psy/react/ssr/renderMiddleware.node'

import { demoSearchPkgName } from '../../pkgName'
import { DemoSearch } from '../../search'
import { demoSearchBootCommonBrowserConfig } from './browserConfig'
import { demoSearchBootCommonServerConfig } from './serverConfig'

export function demoSearchBootCommonServer({
  distRoot = __dirname,
  serverConfig = demoSearchBootCommonServerConfig,
  browserConfig = demoSearchBootCommonBrowserConfig,
  isDev = false,
  fetcher: fetchRaw = (nodeFetch as unknown) as typeof fetch,
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
          psyContextProvideNode(next, ctx =>
            ctx
              .set(PsySsrHydrator.instance, new PsySsrHydratorNode({ __config: browserConfig }))
              .set(demoSearchBootCommonServerConfig, serverConfig)
              .set(demoLibRouterClient, {
                ...ctx.get(demoLibRouterClient),
                location: psySsrLocationNode(req, req.secure),
              })
              .set(DemoLibRouterLocation.instance, new DemoLibRouterLocation(ctx))
              .set(
                PsyFetcher,
                class PsyFetcherNodeConfigured extends PsyFetcherNode {
                  static baseUrl = serverConfig.apiUrl
                  static fetch = fetchRaw
                }
              )
          )
        })
        .use(staticMiddleware)
        .use(
          psySsrRenderMiddleware({
            template: new DemoLibServerIndexHtml({ ...serverConfig }),
            app: () => <DemoSearch id={demoSearchPkgName} />,
          })
        ),
  })
}
