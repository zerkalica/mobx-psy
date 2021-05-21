import '@snap/server/polyfill'

import express from 'express'
import { IncomingMessage, ServerResponse } from 'http'
import nodeFetch from 'node-fetch'
import path from 'path'
import React from 'react'

import { psyContextProvideNode, usePsyContextNode } from '@psy/core/context/provide.node'
import { PsyFetcher } from '@psy/core/fetcher/Fetcher'
import { PsyFetcherNode } from '@psy/core/fetcher/Fetcher.node'
import { PsyLog } from '@psy/core/log/log'
import { psySsrClient } from '@psy/core/ssr/client.node'
import { PsySsrHydrator } from '@psy/core/ssr/Hydrator'
import { PsySsrHydratorNode } from '@psy/core/ssr/Hydrator.node'
import { psySsrMdlAsync } from '@psy/core/ssr/mdlAsync'
import { PsySsrTemplate } from '@psy/core/ssr/Template'
import { SnapRouterLocation } from '@snap/router/location'
import { SnapServerManifest, SnapServerManifestLoader } from '@snap/server/Manifest'
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
    app: () => <AcmeSearch id={acmeSearchPkgName} />,
    port: serverConfig.port,
    init: e =>
      e
        .use(bundlerMdl ?? staticMiddleware)
        .use(
          psySsrMdlAsync(async (req, res, next) => {
            const ctx = usePsyContextNode()
            let manifest = ctx.get(SnapServerManifest)
            if (manifest === SnapServerManifest) manifest = await manifestLoader.load({ outDir })

            psyContextProvideNode(next, $ => {
              const requestId = (req.headers['x-request-id'] as string | undefined) ?? PsyFetcher.requestId()
              const sessionId = (req.headers['x-session-id'] as string | undefined) ?? PsyFetcher.requestId()

              const cli = psySsrClient(req, req.secure)

              return $.set(SnapServerManifest, manifest)
                .set(PsySsrHydrator.instance, new PsySsrHydratorNode({ __config: browserConfig, __files: manifest.files }))
                .set(
                  PsyLog,
                  class PsyLogNodeConfgured extends $.get(PsyLog) {
                    static context() {
                      return {
                        ua: cli.navigator.userAgent,
                        url: cli.location.href,
                        rid: requestId,
                        sid: sessionId,
                      }
                    }
                  }
                )
                .set(
                  PsyFetcher,
                  class PsyFetcherNodeConfigured extends $.get(PsyFetcherNode) {
                    static $ = $
                    static baseUrl = serverConfig.apiUrl
                    static fetch = fetchRaw
                    static requestId = () => requestId
                  }
                )
                .set(SnapRouterLocation.instance, new SnapRouterLocation($, cli))
            })
          })
        )
        .use((req, res, next) => {
          const $ = usePsyContextNode()
          const manifest = $.get(SnapServerManifest)
          const template = new PsySsrTemplate()
          template.titleText = () => 'test'
          template.pkgName = () => acmeSearchPkgName
          template.bodyJs = () => Object.values(manifest.entries).map(src => ({ src: browserConfig.publicUrl + src }))
          console.log('111111111111')
          psyContextProvideNode(next, $ => $.set(PsySsrTemplate.instance, template))
        }),
  })
}
