import express from 'express'
import { locationFromNodeRequest, ServerFetcher } from 'mobx-psy-ssr'

import { DemoLibFetch, DemoLibFetchRequestInit } from '@demo/lib-fetch/fetch'
import { DemoLibRouterLocation } from '@demo/lib-router/location'

import { demoLibServerGetContext, demoLibServerSetContext } from './getContext'

export type DemoLibServerContext = {
  location: DemoLibRouterLocation
  fetcher: ServerFetcher<DemoLibFetchRequestInit>
}

export function demoLibServerContext(req: Object) {
  return demoLibServerGetContext<DemoLibServerContext>(req)
}

export function demoLibServerContextMiddleware({ apiUrl, fetch }: { apiUrl: string; fetch: DemoLibFetch }) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const location = new DemoLibRouterLocation(locationFromNodeRequest(req, req.secure))
    const fetcher = new ServerFetcher<DemoLibFetchRequestInit>({
      fetch,
      apiUrl,
    })

    const context: DemoLibServerContext = {
      location,
      fetcher,
    }

    demoLibServerSetContext(req, context)
    next()
  }
}
