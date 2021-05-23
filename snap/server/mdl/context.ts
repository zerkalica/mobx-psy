import express from 'express'
import nodeFetch from 'node-fetch'
import path from 'path'

import { psyContextProvideNode, usePsyContextNode } from '@psy/core/context/provide.node'
import { PsyFetcher } from '@psy/core/fetcher/Fetcher'
import { PsyFetcherNode } from '@psy/core/fetcher/Fetcher.node'
import { PsyLog } from '@psy/core/log/log'
import { psySsrClient } from '@psy/core/ssr/client.node'
import { PsySsrHydrator } from '@psy/core/ssr/Hydrator'
import { PsySsrHydratorNode } from '@psy/core/ssr/Hydrator.node'
import { psySsrMdlAsync } from '@psy/core/ssr/mdlAsync'
import { SnapRouterLocation } from '@snap/router/location'

import { SnapServerManifest, SnapServerManifestLoader } from '../Manifest'

export function snapServerMdlContext({
  distRoot = __dirname,
  outDir = path.join(distRoot, 'public'),
  browserConfig = {} as Record<string, unknown>,
  serverConfig = { apiUrl: '/' },
  fetcher: fetchRaw = nodeFetch as unknown as typeof fetch,
}) {
  const manifestLoader = new SnapServerManifestLoader()

  return psySsrMdlAsync(async function snapServerMdlContext$(req: express.Request, res: express.Response, next) {
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
}
