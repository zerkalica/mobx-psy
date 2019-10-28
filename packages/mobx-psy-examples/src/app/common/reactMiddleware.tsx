import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only'

import express from 'express'
import { FetchLike } from 'mobx-psy'
import {
  extractHtmlParts,
  locationFromNodeRequest,
  ServerRender,
} from 'mobx-psy-ssr'
import path from 'path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import {indexHtml} from './index.html'

import { MobxPsyExamples, LocationStore, pkgName, stateKey } from '../..'

export const bundleRoot = path.join(__dirname, '..', '..', '..', 'dist', 'bundle')
export const port = process.env.PORT || 8080
export const publicUrl = process.env.PUBLIC_URL || '/'

interface ReactMiddlewareProps {
  apiUrl?: string
  fetch: FetchLike<any>
  publicUrl: string
}

export function reactMiddleware({
  apiUrl = '/',
  fetch,
  publicUrl,
}: ReactMiddlewareProps) {
  const html = indexHtml({publicUrl, entry: 'browser.js'})

  const { header, footerPre, footerPost } = extractHtmlParts({
    pkgName,
    stateKey,
    html,
  })

  return (req: express.Request, res: express.Response, next?: () => void) => {
    const location = new LocationStore(locationFromNodeRequest(req, req.secure))
    new ServerRender({
      fetch,
      apiUrl,
      render: (fetch, cache) =>
        ReactDOMServer.renderToNodeStream(
          <MobxPsyExamples location={location} fetch={fetch} cache={cache} keepCache />
        ),
      success(body, state) {
        res.send(
          `${header}${body}${footerPre}=${JSON.stringify(state)}${footerPost}`
        )
      },
      error(error) {
        console.log(error.stack)
        res.status(500).send('' + error)
      },
    }).run()
  }
}
