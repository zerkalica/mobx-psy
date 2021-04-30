import { errorsCollector } from '@psy/core'

import { ServerFetcher } from './ServerFetcher'

export interface ServerResult {
  html: string
  state: Record<string, any>
  errors: Set<Error>
}

export interface ServerTemplate {
  header: string
  body: string
  footer: string
}

export type ServerRenderFn = () => NodeJS.ReadableStream | string

export class ServerRenderer {
  protected headerWrited = false

  constructor(
    protected options: {
      fetcher: ServerFetcher
      render: ServerRenderFn
      write: (val: string) => void
      template: ServerTemplate
      assertFatalErrors?(error?: Error[]): void
      initialState?: Record<string, any>
    }
  ) {}

  protected getHtml() {
    const { render } = this.options

    return new Promise<{ errors: Set<Error>; html: string }>((resolve, reject) => {
      const errors = (errorsCollector.errors = new Set())
      const original = render()

      if (typeof original === 'string') {
        errorsCollector.errors = undefined

        return resolve({ errors, html: original })
      }

      const chunks: string[] = []

      original.on('data', (chunk: string | Buffer) => {
        if (chunk) chunks.push('' + chunk)
      })

      const cb = (chunk?: string | Buffer) => {
        if (chunk) chunks.push('' + chunk)
        errorsCollector.errors = undefined
        resolve({ errors, html: chunks.join('') })
      }

      original.on('error', cb)
      original.on('end', cb)
    })
  }

  protected async getState(): Promise<ServerResult> {
    const fetcher = this.options.fetcher
    const { html, errors } = await this.getHtml()
    const { end, state } = await fetcher.collectState()

    if (end) return { html, state, errors }

    const next = await this.getState()

    return next
  }

  async run() {
    const data = await this.getState()
    this.next(data)
  }

  protected next({ html, state, errors }: Partial<ServerResult>) {
    const { initialState, write, template, assertFatalErrors } = this.options
    if (errors?.size) assertFatalErrors?.(Array.from(errors))

    const value = `${this.headerWrited ? '' : template.header}${html ?? ''}`

    if (value) write(value)
    if (!this.headerWrited && initialState) state = { ...initialState, ...(state ?? {}) }
    if (state !== undefined) write(`${template.body}${JSON.stringify(state)}${template.footer}`)
    this.headerWrited = true
  }
}
