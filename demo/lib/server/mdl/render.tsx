import { IncomingMessage, ServerResponse } from 'http'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { usePsyContextNode } from '@psy/core/context/provide.node'
import { PsyErrorMix } from '@psy/core/error/Mix'
import { PsySsrRender } from '@psy/core/ssr/Render.node'
import { PsySsrTemplate } from '@psy/core/ssr/Template'
import { PsyContextProvide } from '@psy/react/context/provide'

export function demoLibServerMdlRender({ app, template }: { app: () => React.ReactNode; template: PsySsrTemplate }) {
  return (req: IncomingMessage, response: ServerResponse, next: (err: Error) => void) => {
    const registry = usePsyContextNode()

    new PsySsrRender(registry, {
      template,
      render: $ => ReactDOMServer.renderToNodeStream(<PsyContextProvide parent={$}>{app()}</PsyContextProvide>),
      next: val => response.write(val),
      complete(error) {
        if (error && isFatal(error)) return next(error)
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
