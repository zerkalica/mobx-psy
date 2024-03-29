import http, { IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import serveStatic from 'serve-static'

import { AcmeBuild } from '@acme/build/build'
import { PsyContext } from '@psy/psy/context/Context'
import { PsyLog } from '@psy/psy/log/log'

import { AcmeServerContext } from '../Context'
import { AcmeServerControllerFront } from '../controller/Front'
import { AcmeServerManifestLoader } from '../Manifest'
import { AcmeServerRequestHttp } from '../request/RequestHttp'

export class AcmeServerHttp {
  constructor(protected $ = PsyContext.instance) {}

  fallbackConfig() {
    return { apiUrl: '/', port: 8081, browser: { publicUrl: '/', pkgName: '' } }
  }

  port() {
    return this.fallbackConfig().port
  }

  apiUrl() {
    return this.fallbackConfig().apiUrl
  }

  publicUrl() {
    return this.fallbackConfig().browser.publicUrl
  }

  pkgName() {
    return this.fallbackConfig().browser.pkgName
  }

  isDev() {
    return false
  }

  distRoot() {
    return ''
  }

  publicDir() {
    return path.join(this.distRoot(), 'public')
  }

  protected get log() {
    return this.$.get(PsyLog)
  }

  context() {
    const context = new AcmeServerContext(this.$)
    context.browserConfig = () => this.fallbackConfig().browser
    context.apiUrl = () => this.apiUrl()
    return context
  }

  controller() {
    const controller = new AcmeServerControllerFront()
    controller.publicUrl = () => this.publicUrl()
    controller.pkgName = () => this.pkgName()
    return controller
  }

  protected bundlerCreate() {
    return new AcmeBuild(this.$)
  }

  private bundlerCached = undefined as undefined | AcmeBuild
  protected bundler() {
    if (!this.isDev()) return undefined
    if (this.bundlerCached) return this.bundlerCached

    const bundler = (this.bundlerCached = this.bundlerCreate())
    bundler.publicUrl = () => this.publicUrl()
    bundler.distRoot = () => this.distRoot()
    bundler.publicDir = () => this.publicDir()
    bundler.pkgName = () => this.pkgName()
    bundler.isDev = () => this.isDev()

    return this.bundlerCached
  }

  protected middleware() {
    return this.bundler()?.middleware() ?? serveStatic(this.publicDir(), { index: false })
  }

  protected manifest(reqRaw: IncomingMessage, resRaw: ServerResponse) {
    const manifest = this.bundler()?.manifestFromResponse(resRaw)
    if (manifest) return manifest

    const manifestLoader = new AcmeServerManifestLoader(this.$)
    manifestLoader.publicDir = () => this.publicDir()
    return manifestLoader.load()
  }

  protected async process(reqRaw: IncomingMessage, resRaw: ServerResponse, e?: Error) {
    const manifest = await this.manifest(reqRaw, resRaw)

    const req = new AcmeServerRequestHttp(reqRaw)
    req.manifest = () => manifest

    const context = this.context()
    context.req = () => req

    const $ = await context.build()

    const controller = this.controller()
    controller.$ = $
    controller.req = () => req

    const res = await (e ? controller.fail(e) : controller.run())

    resRaw.writeHead(res.code, { 'Content-Type': res.contentType })
    if (!res.body || typeof res.body === 'string' || res.body instanceof Buffer) return resRaw.end(res.body)

    res.body.pipe(resRaw)
  }

  protected serverCached: http.Server | undefined = undefined

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
    this.server().listen(this.port(), this.ready.bind(this))
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
        `${this.port()}\x1b[0m in \x1b[41m` +
        `${process.env.NODE_ENV}\x1b[0m 🌎...`,
    })
  }
}
