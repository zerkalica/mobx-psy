import express from 'express'

import { DemoLibFetchRequestInit } from '@demo/lib-fetch/fetch.js'
import { DemoLibRouterLocation } from '@demo/lib-router/location.js'
import { createContext, FetchLike } from '@psy/core'
import { locationFromNodeRequest, ServerFetcher } from '@psy/mobx-ssr'

import { DemoLibServerIndexHtml } from '../IndexHtml'

const context = createContext<
  ConstructorParameters<typeof DemoLibServerIndexHtml>[0] & {
    location: DemoLibRouterLocation
    fetcher: ServerFetcher<DemoLibFetchRequestInit>
  }
>('demoLibServerMdlRender')

export type DemoLibServerMdlConfigOptions = {
  fetch: FetchLike<DemoLibFetchRequestInit>
} & Omit<ConstructorParameters<typeof ServerFetcher>[0], 'fetch'> &
  Omit<ReturnType<typeof context.get>, 'location' | 'fetcher'>

export function demoLibServerMdlConfig({ apiUrl, fetch, ...config }: DemoLibServerMdlConfigOptions) {
  return function demoLibServerConfigMiddleware(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const location = new DemoLibRouterLocation(locationFromNodeRequest(req, req.secure))
    const fetcher = new ServerFetcher<DemoLibFetchRequestInit>({
      fetch,
      apiUrl,
    })

    context.set(req, {
      ...config,
      location,
      fetcher,
    })

    next()
  }
}

demoLibServerMdlConfig.get = context.get
