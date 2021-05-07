import { IncomingMessage, ServerResponse } from 'http'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { usePsyContextNode } from '@psy/context/node'
import { PsyContextProvide } from '@psy/context/react'
import { PsyErrorMix } from '@psy/core/ErrorMix'
import { ServerRenderer, ServerTemplate } from '@psy/ssr/ServerRender'

export function demoLibServerMdlRender({ app, template }: { app: () => React.ReactNode; template: ServerTemplate }) {
  return (req: IncomingMessage, response: ServerResponse, next: (err: Error) => void) => {
    const registry = usePsyContextNode()

    new ServerRenderer(registry, {
      template,
      render: () => ReactDOMServer.renderToNodeStream(<PsyContextProvide parent={registry}>{app()}</PsyContextProvide>),
      next: val => response.write(val),
      complete: () => response.end(),
      error: error => {
        if (isFatal(error)) return next(error)
        response.end()
      },
    }).run()
  }
}

class DemoLibError extends Error {
  nonFatal = false
}

function isFatal(error: Error) {
  if (error instanceof PsyErrorMix) return error.errors.forEach(isFatal)
  if (error instanceof DemoLibError && error.nonFatal) return false
  return true
}
