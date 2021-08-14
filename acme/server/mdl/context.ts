import express from 'express'
import nodeFetch from 'node-fetch'
import path from 'path'

import { AcmeRouterLocation } from '@acme/router/location'
import { psyContextProvideNode, usePsyContextNode } from '@psy/psy/context/provide.node'
import { PsyFetcher } from '@psy/psy/fetcher/Fetcher'
import { PsyFetcherNode } from '@psy/psy/fetcher/Fetcher.node'
import { PsyLog } from '@psy/psy/log/log'
import { psySsrClient } from '@psy/psy/ssr/client.node'
import { PsySsrHydrator } from '@psy/psy/ssr/Hydrator'
import { PsySsrHydratorNode } from '@psy/psy/ssr/Hydrator.node'
import { psySsrMdlAsync } from '@psy/psy/ssr/mdlAsync'

import { AcmeServerManifest, AcmeServerManifestLoader } from '../Manifest'

export function acmeServerMdlContext({
  distRoot = __dirname,
  outDir = path.join(distRoot, 'public'),
  browserConfig = {} as Record<string, unknown>,
  serverConfig = { apiUrl: '/' },
  fetcher: fetchRaw = nodeFetch as unknown as typeof fetch,
}) {
  const manifestLoader = new AcmeServerManifestLoader()

  return psySsrMdlAsync(async function acmeServerMdlContext$(req: express.Request, res: express.Response, next) {
    const ctx = usePsyContextNode()
    let manifest = ctx.get(AcmeServerManifest)
    if (manifest === AcmeServerManifest) manifest = await manifestLoader.load({ outDir })

    psyContextProvideNode(next, $ => {
      const requestId = (req.headers['x-request-id'] as string | undefined) ?? PsyFetcher.requestId()
      const sessionId = (req.headers['x-session-id'] as string | undefined) ?? PsyFetcher.requestId()

      const cli = psySsrClient(req, req.secure)

      return $.set(AcmeServerManifest, manifest)
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
        .set(AcmeRouterLocation.instance, new AcmeRouterLocation(cli))
    })
  })
}
