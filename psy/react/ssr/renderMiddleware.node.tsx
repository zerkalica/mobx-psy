import { ServerResponse } from 'http'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { usePsyContextNode } from '@psy/core/context/provide.node'
import { PsyErrorNotFound } from '@psy/core/error/NotFound'
import { PsyLog } from '@psy/core/log/log'
import { psySsrMdlAsync } from '@psy/core/ssr/mdlAsync'
import { PsySsrRender } from '@psy/core/ssr/Render.node'
import { PsySsrTemplate } from '@psy/core/ssr/Template'

import { PsyContextProvide } from '../context/provide'

export function psySsrRenderMiddleware({ app, template }: { app: () => React.ReactNode; template: PsySsrTemplate }) {
  return psySsrMdlAsync(async function psySsrRenderMiddleware$(req, response: ServerResponse, next) {
    const $ = usePsyContextNode()
    const log = $.get(PsyLog)

    const { error, passes, chunk, rendered } = await new PsySsrRender($, {
      render: ctx => ReactDOMServer.renderToNodeStream(<PsyContextProvide parent={ctx} children={app()} />),
      next: val => response.write(val),
      template,
    }).run()

    if (rendered === 0 || !chunk) return next(error)
    if (!error) return response.end(chunk)

    const notFound = error?.filterDeep(PsyErrorNotFound)?.[0]

    if (notFound) response.statusCode = notFound.httpCode

    if (error) log.warn({ place: 'psySsrRenderMiddleware', message: error, passes, rendered })

    response.end(chunk)
  })
}
