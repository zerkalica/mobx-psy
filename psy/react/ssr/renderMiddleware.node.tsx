import { IncomingMessage, ServerResponse } from 'http'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { usePsyContextNode } from '@psy/core/context/provide.node'
import { PsyErrorNotFound } from '@psy/core/error/NotFound'
import { PsySsrRender } from '@psy/core/ssr/Render.node'
import { PsySsrTemplate } from '@psy/core/ssr/Template'

import { PsyContextProvide } from '../context/provide'

export function psySsrRenderMiddleware({ app, template }: { app: () => React.ReactNode; template: PsySsrTemplate }) {
  return (req: IncomingMessage, response: ServerResponse, next: (err?: Error) => void) => {
    const ctx = usePsyContextNode()

    new PsySsrRender(ctx, {
      template,
      render: innerCtx => ReactDOMServer.renderToNodeStream(<PsyContextProvide parent={innerCtx}>{app()}</PsyContextProvide>),
      next: val => response.write(val),
      complete(error, chunk) {
        if (error instanceof PsyErrorNotFound) {
          response.statusCode = error.httpCode
          return response.end(chunk)
        }

        if (!error) return response.end(chunk)

        next(error)
      },
    }).run()
  }
}
