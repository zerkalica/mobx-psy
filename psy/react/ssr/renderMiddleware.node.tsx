import { IncomingMessage, ServerResponse } from 'http'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { usePsyContextNode } from '@psy/core/context/provide.node'
import { psyErrorExtra } from '@psy/core/error/extra'
import { PsySsrRender } from '@psy/core/ssr/Render.node'
import { PsySsrTemplate } from '@psy/core/ssr/Template'

import { PsyContextProvide } from '../context/provide'

export function psySsrRenderMiddleware({ app, template }: { app: () => React.ReactNode; template: PsySsrTemplate }) {
  return (req: IncomingMessage, response: ServerResponse, next: (err: Error) => void) => {
    const registry = usePsyContextNode()

    new PsySsrRender(registry, {
      template,
      render: ctx => ReactDOMServer.renderToNodeStream(<PsyContextProvide parent={ctx}>{app()}</PsyContextProvide>),
      next: val => response.write(val),
      complete(error) {
        if (!error) return response.end()
        const httpCode = psyErrorExtra(error)?.httpCode ?? 200
        if (httpCode >= 400) return next(error)
        response.end()
      },
    }).run()
  }
}
