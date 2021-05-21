import '@snap/server/polyfill'

import express from 'express'
import { promises as fs } from 'fs'
import nodeFetch from 'node-fetch'
import path from 'path'
import React from 'react'

import { psyContextProvideNodeMdl } from '@psy/core/context/provide.node'
import { PsyFetcher } from '@psy/core/fetcher/Fetcher'
import { PsyFetcherNode } from '@psy/core/fetcher/Fetcher.node'
import { PsyLog } from '@psy/core/log/log'
import { PsySsrHydrator } from '@psy/core/ssr/Hydrator'
import { PsySsrHydratorNode } from '@psy/core/ssr/Hydrator.node'
import { psySsrLocationNode } from '@psy/core/ssr/location.node'
import { PsySsrTemplate } from '@psy/core/ssr/Template'
import { PsyTrace } from '@psy/core/trace/trace'
import { psySsrRenderMiddleware } from '@psy/react/ssr/renderMiddleware.node'
import { SnapBuildBundler } from '@snap/build/bundler'
import { snapRouterClient } from '@snap/router/client'
import { SnapRouterLocation } from '@snap/router/location'
import { snapServerMdlError } from '@snap/server/mdl/error'
import { snapServerMdlExpress } from '@snap/server/mdl/express'

import { acmeSearchPkgName } from '../../pkgName'
import { AcmeSearch } from '../../search'
import { acmeSearchBootCommonBrowserConfig } from './browserConfig'
import { acmeSearchBootCommonServerConfig } from './serverConfig'

export async function acmeSearchBootCommonServer({
  distRoot = __dirname,
  serverConfig = acmeSearchBootCommonServerConfig,
  browserConfig = acmeSearchBootCommonBrowserConfig,
  isDev = false,
  noWatch = false,
  fetcher: fetchRaw = nodeFetch as unknown as typeof fetch,
}) {
  const bundler = new SnapBuildBundler({
    publicUrl: serverConfig.publicUrl,
    pkgName: acmeSearchPkgName,
    distRoot,
    noWatch,
  })

  const staticMiddleware = isDev ? bundler.middleware() : express.static(path.join(distRoot, 'public'), { index: false })

  const manifestFile = path.join(distRoot, 'public', 'manifest.json')
  let isExists = false
  try {
    isExists = (await fs.stat(manifestFile)).isFile()
  } catch (e) {}
  const manifestBuf = !isExists ? undefined : await fs.readFile(manifestFile)
  let manifest = !manifestBuf
    ? undefined
    : (JSON.parse(manifestBuf.toString()) as {
        entries: Record<string, string>
        files: Record<string, string>
        version: string
      })

  snapServerMdlExpress({
    port: serverConfig.port,
    init: e =>
      e
        .use(staticMiddleware)
        .use(
          psyContextProvideNodeMdl(async (req: express.Request & { locals?: any }, $) => {
            if (!manifest && req.locals) manifest = await req.locals.devMiddleware.outputFileSystem.readFile('manifest.json')
            const Trace = $.get(PsyTrace)
            const requestId = (req.headers['x-request-id'] as string | undefined) ?? Trace.id()
            const sessionId = (req.cookies?.['x-session-id'] as string | undefined) ?? Trace.id()

            const template = new PsySsrTemplate()
            const publicUrl = browserConfig.publicUrl

            template.titleText = () => 'test'
            template.pkgName = () => acmeSearchPkgName
            template.bodyJs = () => Object.values(manifest.entries).map(src => ({ src: publicUrl + src }))

            return $.set(PsySsrTemplate.instance, template)
              .set(
                PsyTrace,
                class PsyTraceNodeConfigured extends Trace {
                  static get sessionId() {
                    return sessionId
                  }
                  static requestId() {
                    return requestId
                  }
                }
              )
              .set(PsySsrHydrator.instance, new PsySsrHydratorNode({ __config: browserConfig, __files: manifest.files }))
              .set(
                PsyLog,
                class PsyLogNodeConfgured extends $.get(PsyLog) {
                  static $ = $
                }
              )
              .set(
                PsyFetcher,
                class PsyFetcherNodeConfigured extends $.get(PsyFetcherNode) {
                  static baseUrl = serverConfig.apiUrl
                  static fetch = fetchRaw
                  static $ = $
                }
              )
              .set(
                SnapRouterLocation.instance,
                new SnapRouterLocation($, {
                  ...snapRouterClient,
                  location: psySsrLocationNode(req, req.secure),
                })
              )
          })
        )
        .use(psySsrRenderMiddleware(() => <AcmeSearch id={acmeSearchPkgName} />))
        .use(snapServerMdlError),
  })
}
