import express from 'express'
import { ServerRenderer } from 'mobx-psy-ssr'
import ReactDOMServer from 'react-dom/server'

import { DemoLibServerContext, demoLibServerContext } from './contextMiddleware'
import { DemoLibServerIndexHtml } from './IndexHtml'

export function demoLibServerRenderMiddleware({
  render,
  ...options
}: {
  render: (context: DemoLibServerContext) => React.ReactElement
} & ConstructorParameters<typeof DemoLibServerIndexHtml>[0]) {
  return (req: express.Request, response: express.Response, error: express.NextFunction) => {
    const context = demoLibServerContext(req)

    new ServerRenderer({
      fetcher: context.fetcher,
      render: () => ReactDOMServer.renderToNodeStream(render(context)),
      template: new DemoLibServerIndexHtml(options),
      response,
      error,
    }).run()
  }
}
