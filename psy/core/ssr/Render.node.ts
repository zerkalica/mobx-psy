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

export class PsySsrRender {
  protected headerWrited = false

  constructor(
    protected $: PsyContext,
    protected options: {
      template: PsySsrTemplate
      maxIterations?: number
      render: PsySsrRenderFn
      complete(error?: Error): void
      next(val: string): void
    },
    protected hydrator = $.v(PsySsrHydrator.instance),
    protected renderErrors: Error[] = [],
    protected cloned = $.clone(r =>
      r.set(
        PsyLog,
        class PsyLog2 extends PsyLog {
          static error(p: Parameters<typeof PsyLog['error']>[0]) {
            if (p.error) renderErrors.push(p.error)
            super.error(p)
          }
        }
      )
    )
  ) {}

  protected renderStream() {
    return new Promise<void>((resolve, reject) => {
      const cb = (chunk?: string | Buffer) => {
        if (chunk) this.next('' + chunk)
        resolve()
      }

      const original = this.options.render(this.cloned)

      if (typeof original === 'string') return cb(original)

      original.on('data', (chunk: string | Buffer) => {
        if (chunk) this.next('' + chunk)
      })
      original.on('error', e => reject(psyErrorNormalize(e)))
      original.on('end', cb)
    })
  }

  async run() {
    const options = this.options
    const maxIterations = options.maxIterations ?? 10
    let i = 0

    for (; i < maxIterations; i++) {
      this.buffer = ''
      this.renderErrors = []
      await this.renderStream()
      const { state, loading } = await this.hydrator.collect()

      if (loading === 0 || this.buffer === undefined) {
        this.next(`${this.options.template.body}${JSON.stringify(state)}${this.options.template.footer}`)
        break
      }
    }

    const error = this.renderErrors.length > 0 ? new PsyErrorMix(`Server render component errors`, this.renderErrors) : undefined
    this.renderErrors = []
    this.complete(error)

    return i
  }

  protected buffer = this.options.maxIterations === 1 ? undefined : ''

  protected complete(error?: Error) {
    if (this.buffer === undefined) return this.options.complete(error)
    this.options.next(this.buffer)
    this.buffer = ''
    this.options.complete(error)
  }

  protected next(html: string) {
    if (!html) return
    if (!this.headerWrited) html = `${this.options.template.header}${html}`
    this.headerWrited = true

    if (this.buffer === undefined) return this.options.next(html)

    this.buffer += html
  }
}
