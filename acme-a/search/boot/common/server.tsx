import '@acme/server/polyfill'

import express from 'express'
import { IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import React from 'react'

import { AcmeServerManifest } from '@acme/server/Manifest'
import { acmeServer } from '@acme/server/server'
import { usePsyContextNode } from '@psy/psy/context/provide.node'
import { PsySsrTemplate } from '@psy/psy/ssr/Template'
import { psySsrRenderMiddleware } from '@psy/react/ssr/renderMiddleware.node'

import { acmeSearchPkgName } from '../../pkgName'
import { AcmeSearch } from '../../search'
import { acmeSearchBootCommonBrowserConfig } from './browserConfig'
import { acmeSearchBootCommonServerConfig } from './serverConfig'

export function acmeSearchBootCommonServer({
  distRoot = __dirname,
  outDir = path.join(distRoot, 'public'),
  serverConfig = acmeSearchBootCommonServerConfig,
  browserConfig = acmeSearchBootCommonBrowserConfig,
  fetcher = undefined as undefined | typeof fetch,
  bundlerMdl = undefined as undefined | ((req: IncomingMessage, res: ServerResponse, next: (err?: any) => any) => void),
}) {
  acmeServer({
    serverConfig,
    browserConfig,
    outDir,
    fetcher,
    top: e => e.use(bundlerMdl ?? express.static(outDir, { index: false })),
    bottom: e =>
      e.use((req, res, next) => {
        const $ = usePsyContextNode()
        const manifest = $.get(AcmeServerManifest)

        const template = new PsySsrTemplate()
        template.titleText = () => 'test'
        template.pkgName = () => acmeSearchPkgName
        template.bodyJs = () => Object.values(manifest.entries).map(src => ({ src: browserConfig.publicUrl + src }))

        psySsrRenderMiddleware({ app: () => <AcmeSearch id={acmeSearchPkgName} />, template })(req, res, next)
      }),
  })
}
