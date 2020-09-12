import express from 'express'
import { getContext, locationFromNodeRequest, ServerFetcher, setContext } from 'mobx-psy-ssr'

import { DemoLibFetch, DemoLibFetchRequestInit } from '@demo/lib-fetch'
import { DemoLibRouterLocation } from '@demo/lib-router'

export type DemoLibServerContext = {
  location: DemoLibRouterLocation
  fetcher: ServerFetcher<DemoLibFetchRequestInit>
}

export function demoLibServerContext(req: Object) {
  return getContext<DemoLibServerContext>(req)
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

    setContext(req, context)
    next()
  }
}
