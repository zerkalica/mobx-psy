import express from 'express'
import { getContext, locationFromNodeRequest, ServerFetcher, setContext } from 'mobx-psy-ssr'

import { MyFetch, MyFetchRequestInit } from '@my/fetch'
import { MyRouterLocation } from '@my/router'

export type MyServerContext = {
  location: MyRouterLocation
  fetcher: ServerFetcher<MyFetchRequestInit>
}

export function myServerContext(req: Object) {
  return getContext<MyServerContext>(req)
}

export function myServerContextMiddleware({ apiUrl, fetch }: { apiUrl: string; fetch: MyFetch }) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const location = new MyRouterLocation(locationFromNodeRequest(req, req.secure))
    const fetcher = new ServerFetcher<MyFetchRequestInit>({
      fetch,
      apiUrl,
    })

    const context: MyServerContext = {
      location,
      fetcher,
    }

    setContext(req, context)
    next()
  }
}
