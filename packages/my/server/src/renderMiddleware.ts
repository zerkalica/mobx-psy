import express from 'express'
import { ServerRenderer } from 'mobx-psy-ssr'
import ReactDOMServer from 'react-dom/server'

import { MyServerContext, myServerContext } from './contextMiddleware'
import { MyServerIndexHtml } from './IndexHtml'

export function myServerRenderMiddleware({
  render,
  ...options
}: {
  render: (context: MyServerContext) => React.ReactElement
} & ConstructorParameters<typeof MyServerIndexHtml>[0]) {
  return (req: express.Request, response: express.Response, error: express.NextFunction) => {
    const context = myServerContext(req)

    new ServerRenderer({
      fetcher: context.fetcher,
      render: () => ReactDOMServer.renderToNodeStream(render(context)),
      template: new MyServerIndexHtml(options),
      response,
      error,
    }).run()
  }
}
