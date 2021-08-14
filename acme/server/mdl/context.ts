import express from 'express'
import nodeFetch from 'node-fetch'

import { AcmeRouterLocation } from '@acme/router/location'
import { psyContextProvideNode, usePsyContextNode } from '@psy/psy/context/provide.node'
import { PsyFetcher } from '@psy/psy/fetcher/Fetcher'
import { PsyLog } from '@psy/psy/log/log'
import { psySsrClient } from '@psy/psy/ssr/client.node'
import { PsySsrHydrator } from '@psy/psy/ssr/Hydrator'
import { PsySsrHydratorNode } from '@psy/psy/ssr/Hydrator.node'
import { psySsrMdlAsync } from '@psy/psy/ssr/mdlAsync'

import { AcmeServerManifest, AcmeServerManifestLoader } from '../Manifest'

export function acmeServerMdlContext({
  outDir = 'public',
  fallbackConfig = { apiUrl: '/', browser: {} as Record<string, unknown> },
  fetcher: fetchRaw = nodeFetch as unknown as typeof fetch,
}) {
  return psySsrMdlAsync(async function acmeServerMdlContext$(req: express.Request, res: express.Response, next) {
    const ctx = usePsyContextNode()
    const manifest = await new AcmeServerManifestLoader(ctx).load({ outDir })

    psyContextProvideNode(next, $ => {
      const requestId = (req.headers['x-request-id'] as string | undefined) ?? PsyFetcher.requestId()
      const sessionId = (req.headers['x-session-id'] as string | undefined) ?? PsyFetcher.requestId()

      const cli = psySsrClient(req, req.secure)

      return $.set(AcmeServerManifest, manifest)
        .set(PsySsrHydrator.instance, new PsySsrHydratorNode({ __config: fallbackConfig.browser, __files: manifest.files }))
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
          class PsyFetcherNodeConfigured extends $.get(PsyFetcher) {
            static $ = $
            static baseUrl = fallbackConfig.apiUrl
            static fetch = fetchRaw
            static requestId = () => requestId
          }
        )
        .set(AcmeRouterLocation.instance, new AcmeRouterLocation(cli))
    })
  })
}
