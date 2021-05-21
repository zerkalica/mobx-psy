import '@snap/server/polyfill'

import express from 'express'
import { IncomingMessage, ServerResponse } from 'http'
import nodeFetch from 'node-fetch'
import path from 'path'
import React from 'react'

import { psyContextProvideNodeMdl, usePsyContextNode } from '@psy/core/context/provide.node'
import { PsyFetcher } from '@psy/core/fetcher/Fetcher'
import { PsyFetcherNode } from '@psy/core/fetcher/Fetcher.node'
import { PsyLog } from '@psy/core/log/log'
import { PsySsrHydrator } from '@psy/core/ssr/Hydrator'
import { PsySsrHydratorNode } from '@psy/core/ssr/Hydrator.node'
import { psySsrLocationNode } from '@psy/core/ssr/location.node'
import { PsySsrTemplate } from '@psy/core/ssr/Template'
import { PsyTrace } from '@psy/core/trace/trace'
import { psySsrRenderMiddleware } from '@psy/react/ssr/renderMiddleware.node'
import { snapRouterClient } from '@snap/router/client'
import { SnapRouterLocation } from '@snap/router/location'
import { SnapServerManifest, SnapServerManifestLoader } from '@snap/server/Manifest'
import { snapServerMdlError } from '@snap/server/mdl/error'
import { snapServerMdlExpress } from '@snap/server/mdl/express'

import { acmeSearchPkgName } from '../../pkgName'
import { AcmeSearch } from '../../search'
import { acmeSearchBootCommonBrowserConfig } from './browserConfig'
import { acmeSearchBootCommonServerConfig } from './serverConfig'

export async function acmeSearchBootCommonServer({
  distRoot = __dirname,
  outDir = path.join(distRoot, 'public'),
  serverConfig = acmeSearchBootCommonServerConfig,
  browserConfig = acmeSearchBootCommonBrowserConfig,
  fetcher: fetchRaw = nodeFetch as unknown as typeof fetch,
  bundlerMdl = undefined as undefined | ((req: IncomingMessage, res: ServerResponse, next: (err?: any) => any) => void),
}) {
  const staticMiddleware = express.static(outDir, { index: false })
  const manifestLoader = new SnapServerManifestLoader()

  snapServerMdlExpress({
    port: serverConfig.port,
    init: e =>
      e
        .use(bundlerMdl ?? staticMiddleware)
        .use(
          psyContextProvideNodeMdl(async ($, req, res) => {
            let manifest = $.get(SnapServerManifest)
            if (manifest === SnapServerManifest) manifest = await manifestLoader.load({ outDir })
            const Trace = $.get(PsyTrace)
            const requestId = (req.headers['x-request-id'] as string | undefined) ?? Trace.id()
            const sessionId = (req.cookies?.['x-session-id'] as string | undefined) ?? Trace.id()

            const template = new PsySsrTemplate()
            const publicUrl = browserConfig.publicUrl

            template.titleText = () => 'test'
            template.pkgName = () => acmeSearchPkgName
            template.bodyJs = () => Object.values(manifest.entries).map(src => ({ src: publicUrl + src }))

            return $.set(PsySsrTemplate.instance, template)
              .set(SnapServerManifest, manifest)
              .set(
                PsyTrace,
                class PsyTraceNodeConfigured extends Trace {
                  static get sessionId() {
                    return sessionId
                  }
                  static requestId() {
                    return requestId
                  }
                }
              )
              .set(PsySsrHydrator.instance, new PsySsrHydratorNode({ __config: browserConfig, __files: manifest.files }))
              .set(
                PsyLog,
                class PsyLogNodeConfgured extends $.get(PsyLog) {
                  static $ = $
                }
              )
              .set(
                PsyFetcher,
                class PsyFetcherNodeConfigured extends $.get(PsyFetcherNode) {
                  static baseUrl = serverConfig.apiUrl
                  static fetch = fetchRaw
                  static $ = $
                }
              )
              .set(
                SnapRouterLocation.instance,
                new SnapRouterLocation($, {
                  ...snapRouterClient,
                  location: psySsrLocationNode(req, req.secure),
                })
              )
          })
        )
        .get('/version', (req, res) => {
          const $ = usePsyContextNode()
          const manifest = $.get(SnapServerManifest)
          res.send(manifest.version)
        })
        .use(psySsrRenderMiddleware(() => <AcmeSearch id={acmeSearchPkgName} />))
        .use(snapServerMdlError),
  })
}
