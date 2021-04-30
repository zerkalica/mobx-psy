import express from 'express'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import { psyContextPassProvider } from '@psy/context/context'
import { ServerRenderer } from '@psy/mobx-ssr/ServerRender'

import { DemoLibServerIndexHtml } from '../IndexHtml'
import { demoLibServerMdlAsync } from './async'
import { DemoLibServerMdlExpressContext } from './express'

export function demoLibServerMdlRender(app: (id: string) => React.ReactNode) {
  return demoLibServerMdlAsync(async function demoLibServerMdlRender(req: express.Request, response: express.Response) {
    const { fetcher, browserConfig, ...config } = DemoLibServerMdlExpressContext.use()

    const Provider = psyContextPassProvider()
    const render = () => {
      return ReactDOMServer.renderToNodeStream(<Provider>{app(config.pkgName)}</Provider>)
    }
    const title = ''
    const template = new DemoLibServerIndexHtml({ ...config, title })

    const renderer = new ServerRenderer({
      fetcher,
      render,
      template,
      write: val => response.write(val),
      assertFatalErrors(errors) {
        console.error(errors)
      },
      initialState: browserConfig ? { __config: browserConfig } : undefined,
    })

    await renderer.run()

    response.end()
  })
}
