import http, { IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import serveStatic from 'serve-static'

import { AcmeBuild } from '@acme/build/build'
import { PsyContext } from '@psy/psy/context/Context'
import { usePsyContextNode } from '@psy/psy/context/provide.node'
import { PsyLog } from '@psy/psy/log/log'
import { PsySsrTemplate } from '@psy/psy/ssr/Template'

import { AcmeServerControllerFront } from './controller/ControllerFront'
import { AcmeServerManifest } from './Manifest'
import { AcmeServerRequestHttp } from './request/RequestHttp'

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

  bundlerCreate() {
    return new AcmeBuild()
  }

  private bundlerCached = undefined as undefined | AcmeBuild

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

  protected serverCached: http.Server | undefined = undefined

  protected middleware() {
    return this.bundler()?.middleware() ?? serveStatic(this.outDir(), { index: false })
  }

  protected controller() {
    const controller = new AcmeServerControllerFront(this.$)
    controller.outDir = () => this.outDir()

    return controller
  }

  protected async process(reqRaw: IncomingMessage, resRaw: ServerResponse, e?: Error) {
    const req = new AcmeServerRequestHttp(reqRaw)
    const controller = this.controller()
    controller.req = () => req

    const res = await (e ? controller.fail(e) : controller.run())

    resRaw.writeHead(res.statusCode(), { 'Content-Type': res.contentType() })
    const buffer = res.buffer()
    if (!buffer || typeof buffer === 'string' || buffer instanceof Buffer) return resRaw.end(buffer)

    buffer.pipe(resRaw)
  }

  protected server() {
    if (this.serverCached) return this.serverCached
    const mdl = this.middleware()

    this.serverCached = http.createServer((reqRaw, resRaw) => {
      const next = this.process.bind(this, reqRaw, resRaw)
      if (!mdl) return next()

      mdl(reqRaw, resRaw, next)
    })
    this.serverCached.once('error', this.fail.bind(this))

    return this.serverCached
  }

  start() {
    this.server().listen(this.fallbackConfig().port, this.ready.bind(this))
  }

  protected fail(e: Error) {
    this.log.error({
      place: 'AcmeServer.startFail',
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
