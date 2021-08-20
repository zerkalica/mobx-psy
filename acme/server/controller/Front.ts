import { PsyErrorMix } from '@psy/psy/error/Mix'
import { PsyErrorNotFound } from '@psy/psy/error/NotFound'
import { PsySsrTemplate } from '@psy/psy/ssr/Template'
import { PsyReactRenderNode } from '@psy/react/render.node'

import { AcmeServerManifest } from '../Manifest'
import { AcmeServerController } from './Controller'

export class AcmeServerControllerFront extends AcmeServerController {
  protected isDev() {
    return this.$.get(AcmeServerManifest).isDev
  }

  pkgName() {
    return ''
  }

  node() {
    return undefined as React.ReactNode | undefined | void
  }

  publicUrl() {
    return ''
  }

  protected template(e?: Error) {
    const template = new PsySsrTemplate()
    template.error = e
    template.titleText = () => 'test'
    template.pkgName = () => this.pkgName()

    const manifest = this.$.get(AcmeServerManifest)
    template.bodyJs = () => Object.values(manifest.entries).map(src => ({ src: this.publicUrl() + src }))
    template.node = this.node?.bind(this)

    return Promise.resolve(template)
  }

  templateJson(error: Error) {
    return { message: error.message, name: error.name, stack: this.isDev() ? error.stack : undefined }
  }

  async fail(error: Error) {
    const nf = error instanceof PsyErrorMix ? error.find(PsyErrorNotFound) : error
    const code = nf instanceof PsyErrorNotFound ? nf.httpCode : 500
    let body = error.stack as string | Object

    try {
      if (this.req().json()) {
        body = this.templateJson(error)
      } else {
        const t = await this.template(error)
        body = t.render()
      }
    } catch (e) {
      this.log.error({ place: 'AcmeServerControllerFront.fail#template', message: e })
    } finally {
      this.log.error({ place: 'AcmeServerControllerFront.fail', message: error })
    }

    return this.res({ code, body })
  }

  async version() {
    if (this.req().url() !== '/version') return
    const manifest = this.$.get(AcmeServerManifest)

    return this.res({
      body: { version: manifest.version },
    })
  }

  async favIcon() {
    if (this.req().url() !== '/favicon.ico') return

    return this.res({})
  }

  async render() {
    const template = await this.template()
    const renderer = new PsyReactRenderNode(this.$)
    renderer.template = () => template

    const stat = await renderer.run()

    if (!stat.chunk) return

    return this.res({
      code: stat.error?.find(PsyErrorNotFound)?.httpCode,
      body: stat.chunk,
    })
  }

  // prettier-ignore
  async chain() {
    return await this.version() ??
    await this.favIcon() ??
    await this.render()
  }

  async run() {
    try {
      const res = await super.run()
      if (!res) throw new PsyErrorNotFound('Request not handlered')

      return res
    } catch (error) {
      return this.fail(error)
    }
  }
}
