import fetchRaw from 'node-fetch'

import { AcmeRouterLocation } from '@acme/router/location'
import { PsyContext } from '@psy/psy/context/Context'
import { PsyErrorMix } from '@psy/psy/error/Mix'
import { PsyErrorNotFound } from '@psy/psy/error/NotFound'
import { PsyFetcher } from '@psy/psy/fetcher/Fetcher'
import { PsyLog } from '@psy/psy/log/log'
import { PsySsrHydrator } from '@psy/psy/ssr/Hydrator'
import { PsySsrHydratorNode } from '@psy/psy/ssr/Hydrator.node'
import { PsySsrTemplate } from '@psy/psy/ssr/Template'
import { PsyReactRenderNode } from '@psy/react/render.node'

import { AcmeServerManifest, AcmeServerManifestLoader } from '../Manifest'
import { AcmeServerResponse } from '../response/Response'
import { AcmeServerController } from './Controller'

export class AcmeServerControllerFront extends AcmeServerController {
  constructor(protected parentCtx: PsyContext) {
    super()
  }

  protected $ = new PsyContext(this.parentCtx)

  logger() {
    const req = this.req()
    const PsyLogParent = this.$.get(PsyLog)

    return class PsyLogNodeConfgured extends PsyLogParent {
      static context() {
        return {
          ua: req.ua(),
          url: req.url() ?? '',
          rid: req.id(),
          sid: req.sid(),
        }
      }
    } as typeof PsyLog
  }

  fetcher() {
    const requestId = () => this.req().id()
    const $ = this.$

    const fallbackConfig = {} as any

    const ParentFetcher = this.$.get(PsyFetcher)

    return class PsyFetcherNodeConfigured extends ParentFetcher {
      static $ = $
      static baseUrl = fallbackConfig.apiUrl
      static fetch = fetchRaw as unknown as typeof fetch
      static requestId = requestId
    }
  }

  hydrator() {
    const fallbackConfig = {} as any
    return new PsySsrHydratorNode({ __config: fallbackConfig.browser, __files: this.$.get(AcmeServerManifest).files })
  }

  location() {
    return new AcmeRouterLocation(this.req().location())
  }

  outDir() {
    return ''
  }

  manifestLoader() {
    const manifestLoader = new AcmeServerManifestLoader(this.$)
    manifestLoader.outDir = () => this.outDir()
    return manifestLoader
  }

  async context() {
    this.$.set(AcmeServerManifest, await this.manifestLoader().load())
      .set(PsyFetcher, this.fetcher())
      .set(PsySsrHydrator.instance, this.hydrator())
      .set(AcmeRouterLocation.instance, this.location())
      .set(PsyLog, this.logger())
  }

  protected isDev() {
    return this.$.get(AcmeServerManifest).isDev
  }

  failTemplateJson(error: Error) {
    return JSON.stringify(this.isDev() ? error : { message: error.message, name: error.name })
  }

  failTemplateHtml(error: Error) {
    const t = new PsySsrTemplate()
    t.error = error
    return t
  }

  failTemplate(error: Error) {
    if (this.req().json()) return this.failTemplateJson(error)

    return this.failTemplateHtml(error).render()
  }

  async fail(error: Error) {
    let chunk = error.stack
    const log = this.$.get(PsyLog)

    try {
      chunk = this.failTemplate(error)
    } catch (e) {
      log.error({ place: 'AcmeServerRequest.fail#template', message: e })
    } finally {
      log.error({ place: 'AcmeServerRequest.fail', message: error })
    }

    const nf = error instanceof PsyErrorMix ? error.filter(PsyErrorNotFound)?.[0] : error
    const httpCode = nf instanceof PsyErrorNotFound ? nf.httpCode : 500
    const contentType = this.req().json() ? 'application/json' : 'text/html'

    const res = this.res()

    res.statusCode = () => httpCode
    res.contentType = () => contentType
    res.buffer = () => chunk

    return res
  }

  async top() {
    return undefined as undefined | AcmeServerResponse
  }

  async version() {
    if (this.req().url() !== '/version') return
    const manifest = this.$.get(AcmeServerManifest)
    const res = this.res()
    res.contentType = () => 'application/json'
    res.buffer = () => JSON.stringify({ version: manifest.version })

    return res
  }

  async favIcon() {
    if (this.req().url() !== '/favicon.ico') return
    const res = this.res()

    return res
  }

  pkgName() {
    return ''
  }

  protected renderTemplate() {
    const manifest = this.$.get(AcmeServerManifest)
    const config = this.fallbackConfig()

    const template = new PsySsrTemplate()
    template.titleText = () => 'test'
    template.pkgName = () => this.pkgName()
    template.bodyJs = () => Object.values(manifest.entries).map(src => ({ src: config.browser.publicUrl + src }))

    if (this.node) template.node = this.node.bind(this)

    return Promise.resolve(template)
  }

  async render() {
    const template = await this.renderTemplate()
    const res = this.res()
    const renderer = new PsyReactRenderNode(this.$)
    renderer.template = () => template

    const stat = await renderer.run()

    const httpCode = stat.error?.find(PsyErrorNotFound)?.httpCode ?? 200

    if (stat.chunk) {
      res.contentType = () => 'text/html'
      res.statusCode = () => httpCode
      res.buffer = () => stat.chunk

      return res
    }
  }

  // prettier-ignore
  async process() {
    return await this.top() ??
    await this.context() ??
    await this.version() ??
    await this.favIcon() ??
    await this.render()
  }

  async run() {
    try {
      const res = await this.process()
      if (!res) throw new PsyErrorNotFound('Request not handlered')

      return res
    } catch (error) {
      return this.fail(error)
    }
  }
}
