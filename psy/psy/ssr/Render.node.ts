import { PsyContext } from '../context/Context'
import { PsyErrorMix } from '../error/Mix'
import { psyErrorNormalize } from '../error/normalize'
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

export class PsySsrRender {
  protected headerWrited = false

  constructor(
    protected $: PsyContext,
    protected options: {
      template: PsySsrTemplate
      maxIterations?: number
      render: PsySsrRenderFn
      next(val: string): void
    },
    protected hydrator = $.get(PsySsrHydrator.instance)
  ) {}

  protected renderStream() {
    return new Promise<void>((resolve, reject) => {
      const cb = (chunk?: string | Buffer) => {
        if (chunk) this.next('' + chunk)
        resolve()
      }

      const original = this.options.render(this.$)

      if (typeof original === 'string') return cb(original)

      original.on('data', (chunk: string | Buffer) => {
        if (chunk) this.next('' + chunk)
      })
      original.on('error', e => reject(psyErrorNormalize(e)))
      original.on('end', cb)
    })
  }

  async run() {
    const maxIterations = this.options.maxIterations ?? 10

    for (let passes = 0; passes < maxIterations; passes++) {
      this.buffer = this.bufferInitial
      this.headerWrited = false

      await this.renderStream()

      const { state, pending, errors, rendered } = await this.hydrator.collect()

      if (pending !== 0 && this.buffer !== undefined) continue

      this.next(this.options.template.renderEnd(state))
      const error =
        errors.length > 0 ? new PsySsrRenderError(`Server render component errors`, errors, rendered, passes) : undefined

      return {
        rendered,
        passes,
        error,
        chunk: this.buffer,
      }
    }

    throw new PsySsrRenderError(`Render max render passes reached: ${maxIterations}`, [], 0, maxIterations)
  }

  protected get bufferInitial() {
    return this.options.maxIterations === 1 ? undefined : ''
  }

  protected buffer = this.bufferInitial

  protected next(html: string) {
    if (!html) return
    if (!this.headerWrited) html = `${this.options.template.renderBegin()}${html}`
    this.headerWrited = true

    if (this.buffer === undefined) return this.options.next(html)

    this.buffer += html
  }
}
