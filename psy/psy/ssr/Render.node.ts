import { PsyContext } from '../context/Context'
import { PsyErrorMix } from '../error/Mix'
import { psyErrorNormalize } from '../error/normalize'
import { PsyLog } from '../log/log'
import { PsySsrHydrator } from './Hydrator'
import { PsySsrTemplate } from './Template'

export interface PsySsrRenderResult {
  html: string
  state: Record<string, any>
  errors: Set<Error>
}

export type PsySsrRenderFn = (r: PsyContext) => NodeJS.ReadableStream | string

export class PsySsrRenderError extends PsyErrorMix {
  constructor(message: string, errors: readonly Error[], readonly rendered: number, readonly passes: number) {
    super(message, errors)
  }
}

export class PsySsrRenderNode {
  protected headerWrited = false

  constructor(protected $: PsyContext) {}

  protected get hydrator() {
    return this.$.get(PsySsrHydrator.instance)
  }

  protected get log() {
    return this.$.get(PsyLog)
  }

  maxIterations() {
    return 10
  }

  protected templateCached = undefined as undefined | PsySsrTemplate

  template() {
    return this.templateCached ?? (this.templateCached = new PsySsrTemplate())
  }

  render(r: PsyContext): NodeJS.ReadableStream | string {
    return ''
  }

  protected renderStream() {
    return new Promise<void>((resolve, reject) => {
      const cb = (chunk?: string | Buffer) => {
        if (chunk) this.chunk('' + chunk)
        resolve()
      }

      const original = this.render(this.$)

      if (typeof original === 'string') return cb(original)

      original.on('data', (chunk: string | Buffer) => {
        if (chunk) this.chunk('' + chunk)
      })
      original.on('error', e => reject(psyErrorNormalize(e)))
      original.on('end', cb)
    })
  }

  async run() {
    const maxIterations = this.maxIterations()

    for (let passes = 0; passes < maxIterations; passes++) {
      this.buffer = ''
      this.headerWrited = false

      await this.renderStream()

      const { state, pending, errors, rendered } = await this.hydrator.collect()

      if (pending !== 0) continue

      this.chunk(this.template().renderEnd(state))
      const error =
        errors.length > 0 ? new PsySsrRenderError(`Server render component errors`, errors, rendered, passes) : undefined

      const chunk = rendered > 0 ? this.buffer : undefined
      // no html - critical error
      if (error && !chunk) throw error

      if (error) this.log.warn({ place: 'psyReactMiddleware', message: error, passes, rendered })

      return {
        rendered,
        passes,
        error,
        chunk,
      }
    }

    throw new PsySsrRenderError(`Render max render passes reached: ${maxIterations}`, [], 0, maxIterations)
  }

  protected buffer = ''

  protected chunk(html: string) {
    if (!html) return
    if (!this.headerWrited) html = `${this.template().renderBegin()}${html}`
    this.headerWrited = true

    this.buffer += html
  }
}
