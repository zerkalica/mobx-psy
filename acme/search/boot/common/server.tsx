import '@snap/server/polyfill'

import express from 'express'
import nodeFetch from 'node-fetch'
import path from 'path'
import React from 'react'

import { psyContextProvideNode } from '@psy/core/context/provide.node'
import { PsyFetcher } from '@psy/core/fetcher/Fetcher'
import { PsyFetcherNode } from '@psy/core/fetcher/Fetcher.node'
import { PsyLog } from '@psy/core/log/log'
import { PsySsrHydrator } from '@psy/core/ssr/Hydrator'
import { PsySsrHydratorNode } from '@psy/core/ssr/Hydrator.node'
import { psySsrLocationNode } from '@psy/core/ssr/location.node'
import { PsySsrTemplate } from '@psy/core/ssr/Template'
import { PsyTrace } from '@psy/core/trace/trace'
import { psySsrRenderMiddleware } from '@psy/react/ssr/renderMiddleware.node'
import { snapBuildBundler } from '@snap/build/bundler'
import { snapRouterClient } from '@snap/router/client'
import { SnapRouterLocation } from '@snap/router/location'
import { snapServerMdlError } from '@snap/server/mdl/error'
import { snapServerMdlExpress } from '@snap/server/mdl/express'

import { acmeSearchPkgName } from '../../pkgName'
import { AcmeSearch } from '../../search'
import { acmeSearchBootCommonBrowserConfig } from './browserConfig'
import { acmeSearchBootCommonServerConfig } from './serverConfig'

export function acmeSearchBootCommonServer({
  distRoot = __dirname,
  serverConfig = acmeSearchBootCommonServerConfig,
  browserConfig = acmeSearchBootCommonBrowserConfig,
  isDev = false,
  noWatch = false,
  fetcher: fetchRaw = nodeFetch as unknown as typeof fetch,
}) {
  const staticMiddleware = isDev
    ? snapBuildBundler({
        publicUrl: serverConfig.publicUrl,
        pkgName: acmeSearchPkgName,
        distRoot,
        noWatch,
        isDev,
      }).middleware()
    : express.static(path.join(distRoot, 'public'), { index: false })

  snapServerMdlExpress({
    port: serverConfig.port,
    init: e =>
      e
        .use((req, res, next) => {
          psyContextProvideNode(next, ctx => {
            const requestId = (req.headers['x-request-id'] as string | undefined) ?? PsyTrace.id()
            const sessionId = (req.cookies['x-session-id'] as string | undefined) ?? PsyTrace.id()

            const template = new PsySsrTemplate()

            template.titleText = () => 'test'
            template.pkgName = () => acmeSearchPkgName
            template.bodyJs = () => [{ src: serverConfig.publicUrl + acmeSearchPkgName + '.js' }]

            return ctx
              .set(PsySsrTemplate.instance, template)
              .set(
                PsyTrace,
                class PsyTraceNodeConfigured extends PsyTrace {
                  static get sessionId() {
                    return sessionId
                  }
                  static requestId() {
                    return requestId
                  }
                }
              )
              .set(PsySsrHydrator.instance, new PsySsrHydratorNode({ __config: browserConfig }))
              .set(
                PsyLog,
                class PsyLogNodeConfgured extends PsyLog {
                  static $ = ctx
                }
              )
              .set(
                PsyFetcher,
                class PsyFetcherNodeConfigured extends PsyFetcherNode {
                  static baseUrl = serverConfig.apiUrl
                  static fetch = fetchRaw
                  static $ = ctx
                }
              )
              .set(
                SnapRouterLocation.instance,
                new SnapRouterLocation(ctx, {
                  ...snapRouterClient,
                  location: psySsrLocationNode(req, req.secure),
                })
              )
          })
        })
        .use(staticMiddleware)
        .use(psySsrRenderMiddleware(() => <AcmeSearch id={acmeSearchPkgName} />))
        .use(snapServerMdlError),
  })
}
