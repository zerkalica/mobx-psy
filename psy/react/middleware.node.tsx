import { ServerResponse } from 'http'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { usePsyContextNode } from '@psy/psy/context/provide.node'
import { PsyErrorNotFound } from '@psy/psy/error/NotFound'
import { PsyLog } from '@psy/psy/log/log'
import { psySsrMdlAsync } from '@psy/psy/ssr/mdlAsync'
import { PsySsrRender } from '@psy/psy/ssr/Render.node'
import { PsySsrTemplate } from '@psy/psy/ssr/Template'

import { PsyReactProvide } from './provide'

export function psyReactMiddleware({ template }: { template: PsySsrTemplate }) {
  return psySsrMdlAsync(async function psyReactMiddleware$(req, response: ServerResponse, next) {
    const $ = usePsyContextNode()
    const log = $.get(PsyLog)

    const { error, passes, chunk, rendered } = await new PsySsrRender($, {
      render: ctx =>
        ReactDOMServer.renderToNodeStream(<PsyReactProvide parent={ctx} children={template.node() as React.ReactNode} />),
      next: val => response.write(val),
      template,
    }).run()
    if (rendered === 0 || !chunk) return next(error)
    if (!error) return response.end(chunk)

    const notFound = error?.filterDeep(PsyErrorNotFound)?.[0]

    if (notFound) response.statusCode = notFound.httpCode

    if (error) log.warn({ place: 'psyReactMiddleware', message: error, passes, rendered })

    response.end(chunk)
  })
}
