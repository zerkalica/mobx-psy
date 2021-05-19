import { IncomingMessage, ServerResponse } from 'http'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { usePsyContextNode } from '@psy/core/context/provide.node'
import { PsyErrorNotFound } from '@psy/core/error/NotFound'
import { PsyLog } from '@psy/core/log/log'
import { psySsrMdlAsync } from '@psy/core/ssr/mdlAsync'
import { PsySsrRender } from '@psy/core/ssr/Render.node'

import { PsyContextProvide } from '../context/provide'

export function psySsrRenderMiddleware(app: () => React.ReactNode) {
  return psySsrMdlAsync(async function psySsrRenderMiddleware$(req: IncomingMessage, response: ServerResponse, next) {
    const $ = usePsyContextNode()
    const log = $.get(PsyLog)

    const { error, passes, chunk, rendered } = await new PsySsrRender($, {
      render: innerCtx => ReactDOMServer.renderToNodeStream(<PsyContextProvide parent={innerCtx} children={app()} />),
      next: val => response.write(val),
    }).run()

    if (rendered === 0 || !chunk) return next(error)
    if (!error) return response.end(chunk)

    const notFound = error?.filterDeep(PsyErrorNotFound)?.[0]

    if (notFound) response.statusCode = notFound.httpCode

    if (error) log.warn({ place: 'psySsrRenderMiddleware', message: error, passes, rendered })

    response.end(chunk)
  })
}
