import express from 'express'
import path from 'path'

import { AcmeBuildBundler } from '@acme/build/bundler'
import { PsyContext } from '@psy/psy/context/Context'
import { usePsyContextNode } from '@psy/psy/context/provide.node'
import { PsyLog } from '@psy/psy/log/log'
import { psySsrMdlAsync } from '@psy/psy/ssr/mdlAsync'
import { PsySsrTemplate } from '@psy/psy/ssr/Template'
import { psyReactMiddleware } from '@psy/react/middleware.node'

import { AcmeServerManifest } from './Manifest'
import { acmeServerMdlContext } from './mdl/context'
import { acmeServerMdlError } from './mdl/error'

export class AcmeServer {
  constructor(protected parentCtx = PsyContext.instance) {}

  protected get $() {
    return usePsyContextNode(this.parentCtx)
  }

  fallbackConfig() {
    return { apiUrl: '/', port: 8081, browser: { publicUrl: '/', pkgName: '' } }
  }

  fetcher() {
    return undefined as undefined | typeof fetch
  }

  isDev() {
    return false
  }

  distRoot() {
    return ''
  }

  outDir() {
    return this.bundler()?.outDir() ?? path.join(this.distRoot(), 'public')
  }

  protected get log() {
    return this.$.get(PsyLog)
  }

  protected srv = express()

  bundlerCreate() {
    return new AcmeBuildBundler()
  }

  private bundlerCached = undefined as undefined | AcmeBuildBundler

  private bundler() {
    if (!this.isDev()) return undefined
    if (this.bundlerCached) return this.bundlerCached

    const bundler = (this.bundlerCached = this.bundlerCreate())
    bundler.publicUrl = () => this.fallbackConfig().browser.publicUrl
    bundler.distRoot = () => this.distRoot()
    bundler.pkgName = () => this.fallbackConfig().browser.pkgName
    bundler.isDev = () => this.isDev()

    return this.bundlerCached
  }

  protected staticMdl() {
    const mdl = this.bundler()?.middleware() ?? express.static(this.outDir(), { index: false })

    this.srv.use(mdl)
  }

  protected contextMdl() {
    return this.srv.use(
      acmeServerMdlContext({
        outDir: this.outDir(),
        fallbackConfig: this.fallbackConfig(),
        fetcher: this.fetcher(),
      })
    )
  }

  protected versionMdl() {
    this.srv.get('/version', (req, res) => {
      const $ = usePsyContextNode()
      const manifest = $.get(AcmeServerManifest)
      res.send(manifest.version)
    })
  }

  protected faviconMdl() {
    this.srv.use((req, res) => {
      res.status(200).end()
    })
  }

  protected errorMdl() {
    this.srv.use(acmeServerMdlError)
  }

  node() {
    return undefined as unknown | undefined
  }

  pkgName() {
    return this.fallbackConfig().browser.pkgName
  }

  protected template() {
    const manifest = this.$.get(AcmeServerManifest)
    const config = this.fallbackConfig()

    const template = new PsySsrTemplate()
    template.titleText = () => 'test'
    template.pkgName = () => this.pkgName()
    template.bodyJs = () => Object.values(manifest.entries).map(src => ({ src: config.browser.publicUrl + src }))
    if (this.node) template.node = this.node.bind(this)

    return Promise.resolve(template)
  }

  protected renderMdl() {
    if (!this.node) return undefined

    this.srv.use(
      psySsrMdlAsync(async (req, res, next) => {
        const template = await this.template()
        psyReactMiddleware({ template })(req, res, next)
      })
    )
  }

  protected mdl() {
    this.staticMdl()
    this.versionMdl()
    this.faviconMdl()
    this.contextMdl()
    this.renderMdl()
  }

  start() {
    this.mdl()
    this.errorMdl()
    this.srv.once('error', this.fail.bind(this))
    this.srv.listen(this.fallbackConfig().port, this.ready.bind(this))
  }

  protected fail(e: Error) {
    this.log.error({
      place: 'AcmeServer.fail',
      message: e,
    })
  }

  protected ready() {
    this.log.debug({
      place: 'AcmeServer.ready',
      message:
        `Server listening on \x1b[42m\x1b[1mhttp://localhost:` +
        `${this.fallbackConfig().port}\x1b[0m in \x1b[41m` +
        `${process.env.NODE_ENV}\x1b[0m 🌎...`,
    })
  }
}
