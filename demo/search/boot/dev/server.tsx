import '@demo/lib-server/polyfill'

import express from 'express'
import React from 'react'

import { demoLibBuildBundler } from '@demo/lib-build/bundler'
import { demoLibServerOnListen } from '@demo/lib-server/onListen'
import { demoLibServerMdlConfig } from '@demo/lib-server/mdl/config'
import { demoLibServerMdlError } from '@demo/lib-server/mdl/error'
import { demoLibServerMdlRender } from '@demo/lib-server/mdl/render'

import { demoSearchPkgName } from '../../pkgName'
import { DemoSearch } from '../../search'
import { demoSearchBootCommonServerConfig } from '../common/serverConfig'
import { demoSearchBootDevBrowserConfig } from './browserConfig'
import { demoSearchBootDevMocks } from './mocks'
import { DemoLibUIContextBuilder } from '@demo/lib-ui/context'
import { DemoLibFetchProvider } from '@demo/lib-fetch/fetch'

const config = {
  ...demoSearchBootCommonServerConfig,
  ...demoSearchBootDevBrowserConfig,
  pkgName: demoSearchPkgName,
}

const configMiddleware = demoLibServerMdlConfig({
  ...config,
  fetch: demoSearchBootDevMocks({
    errorRate: 1,
    timeout: 100,
  }),
})

const bundlerMiddleware = demoLibBuildBundler({
  publicUrl: config.publicUrl,
  minify: false,
  distRoot: __dirname,
}).middleware()

express()
  .use(configMiddleware)
  .use(bundlerMiddleware)
  .use(
    demoLibServerMdlRender({
      render(host) {
        const { location, fetcher, pkgName } = demoLibServerMdlConfig.get(host)

        const ctx = new DemoLibUIContextBuilder().v(DemoLibFetchProvider, {
          fetch: fetcher.fetch,
          location,
        })
        return <ctx.Provider><DemoSearch id={pkgName} /></ctx.Provider>
      },
    })
  )
  .use(demoLibServerMdlError)
  .listen(config.port, demoLibServerOnListen({ port: config.port }))
