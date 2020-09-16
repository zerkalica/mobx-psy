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
  watch: true,
}).middleware()

express()
  .use(configMiddleware)
  .use(bundlerMiddleware)
  .use(
    demoLibServerMdlRender({
      render(host) {
        const { location, fetcher, pkgName } = demoLibServerMdlConfig.get(host)

        return <DemoSearch id={pkgName} location={location} fetch={fetcher.fetch} />
      },
    })
  )
  .use(demoLibServerMdlError)
  .listen(config.port, demoLibServerOnListen({ port: config.port }))
