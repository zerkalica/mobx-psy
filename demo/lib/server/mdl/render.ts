import express from 'express'
import ReactDOMServer from 'react-dom/server'

import { ServerRenderer } from '@psy/mobx-ssr'

import { DemoLibServerIndexHtml } from '../IndexHtml'
import { demoLibServerMdlConfig } from './config'

export function demoLibServerMdlRender(options: {
  render: <Host extends {}>(contextHost: Host) => React.ReactElement
}) {
  return function demoLibServerMdlRender(
    req: express.Request,
    response: express.Response,
    error: express.NextFunction
  ) {
    const { fetcher, ...config } = demoLibServerMdlConfig.get(req)
    const render = () => ReactDOMServer.renderToNodeStream(options.render(req))
    const template = new DemoLibServerIndexHtml(config)

    const renderer = new ServerRenderer({
      fetcher,
      render,
      template,
      response,
      error,
    })

    renderer.run()
  }
}
