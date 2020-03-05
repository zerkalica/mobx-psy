import { HydratedState } from 'mobx-psy'
import { ServerFetcher } from './ServerFetcher'

export interface ServerResult {
  html: string
  state: HydratedState
}

export interface ServerTemplate {
  header: string
  body: string
  footer: string
}

export type ServerRenderFn = () => NodeJS.ReadableStream | string

export class ServerRenderer<Init> {
  protected headerWrited = false

  constructor(
    protected options: {
      fetcher: ServerFetcher<Init>
      render: ServerRenderFn
      response: NodeJS.WritableStream
      template: ServerTemplate
      error?(error?: Error): void
    }
  ) {}

  protected getHtml(): Promise<string> {
    const { render } = this.options

    return new Promise<string>((resolve, reject) => {
      const original = render()

      if (typeof original === 'string') return resolve(original)

      const chunks: string[] = []

      original.on('data', (chunk: string | Buffer) => {
        if (chunk) chunks.push('' + chunk)
      })

      original.on('error', (error: Error) => reject(error))

      original.on('end', (chunk: string | Buffer) => {
        if (chunk) chunks.push('' + chunk)
        resolve(chunks.join(''))
      })
    })
  }

  protected getState(): Promise<ServerResult> {
    const {
      options: { fetcher },
    } = this

    return this.getHtml().then(html => {
      return fetcher.collectState().then(({ state, end }) => {
        if (end) return { html, state }
        return this.getState()
      })
    })
  }

  run() {
    return this.getState()
      .then(data => {
        this.next(data)
        this.complete()

        return this.options.response
      })
      .catch(this.error.bind(this))
  }

  protected error(error: Error) {
    if (this.options.error) this.options.error(error)
  }

  protected complete() {
    this.options.response.end()
  }

  protected next({ html, state }: Partial<ServerResult>) {
    const { response, template } = this.options

    const value = `${this.headerWrited ? '' : template.header}${html ?? ''}`
    this.headerWrited = true

    if (value) response.write(value)
    if (state !== undefined) response.write(`${template.body}${JSON.stringify(state)}${template.footer}`)
  }
}
