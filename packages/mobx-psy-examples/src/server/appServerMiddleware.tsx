import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'

import fs from 'fs'
import express from 'express'

import {
  extractHtmlParts,
  locationFromNodeRequest,
  ServerRender,
} from 'mobx-psy-ssr'
import fetch from 'node-fetch'
import path from 'path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { App } from '../App'
import { createFetch } from '../mocks'
import { pkgName, stateKey } from '../pkg'
import { LocationStore } from '../router'
import { FetchLike } from 'mobx-psy'

export type AppServerProps = Partial<Parameters<typeof createFetch>[0]> & {
  apiUrl?: string
  secure?: boolean
}

const template = path.join(__dirname, '..', 'bundle', 'index.html')
const html = fs.readFileSync(template).toString()
const { header, footerPre, footerPost } = extractHtmlParts({
  pkgName,
  stateKey,
  html,
  template,
})

export function appServerMiddleware({
  secure,
  errorRate = 1,
  timeout = 500,
  apiUrl = '/',
}: AppServerProps) {
  const fetch: FetchLike<any> = createFetch({
    errorRate,
    timeout,
  })
  return (req: express.Request, res: express.Response, next: () => void) => {
    const location = new LocationStore(locationFromNodeRequest(req, secure))
    new ServerRender({
      fetch,
      apiUrl,
      render: (fetch, cache) =>
        ReactDOMServer.renderToNodeStream(
          <App location={location} fetch={fetch} cache={cache} keepCache />
        ),
      success(body, state) {
        res.send(`${header}${body}${footerPre}=${JSON.stringify(state)}${footerPost}`)
      },
      error(error) {
        console.log(error.stack)
        res.status(500).send('' + error)
      },
    }).run()
  }
}
