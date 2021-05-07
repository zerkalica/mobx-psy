import { PsyContextRegistry } from '@psy/context/Registry'
import { errorsCollector, normalizeError } from '@psy/core/common'
import { PsyErrorMix } from '@psy/core/ErrorMix'

import { Hydrator } from './Hydrator'

export interface ServerResult {
  html: string
  state: Record<string, any>
  errors: Set<Error>
}

export abstract class ServerTemplate {
  static $$psy = true

  get header() {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>title</title>
  </head>
  <body>
`
  }

  get body() {
    return ''
  }

  get footer() {
    return '</body></html>'
  }

  toString() {
    return `${this.header}${this.body}{}${this.footer}`
  }
}

export type ServerRenderFn = () => NodeJS.ReadableStream | string

export class ServerRenderer {
  protected headerWrited = false

  constructor(
    protected $: PsyContextRegistry,
    protected options: {
      template: ServerTemplate
      maxIterations?: number
      render: ServerRenderFn
      complete(): void
      next(val: string): void
      error(error: Error): void
    },
    protected hydrator = $.v(Hydrator)
  ) {}

  protected renderStream() {
    return new Promise<void>((resolve, reject) => {
      const cb = (chunk?: string | Buffer) => {
        if (chunk) this.next('' + chunk)
        resolve()
      }

      const original = this.options.render()

      if (typeof original === 'string') return cb(original)

      original.on('data', (chunk: string | Buffer) => {
        if (chunk) this.next('' + chunk)
      })
      original.on('error', e => reject(normalizeError(e)))
      original.on('end', cb)
    })
  }

  async run() {
    const options = this.options
    const maxIterations = options.maxIterations ?? 10
    let i = 0
    let errors = new Set<Error>()

    for (; i < maxIterations; i++) {
      this.buffer = ''
      const oldErrors = errorsCollector.errors
      errors = errorsCollector.errors = new Set()

      await this.renderStream()

      const { state, loading } = await this.hydrator.collect()

      errorsCollector.errors = oldErrors

      if (loading === 0 || this.buffer === undefined) {
        this.next(`${this.options.template.body}${JSON.stringify(state)}${this.options.template.footer}`)
        break
      }
    }

    errors.size > 0 ? this.error(new PsyErrorMix(`Server render component errors`, Array.from(errors))) : this.complete()

    return i
  }

  protected buffer = this.options.maxIterations === 1 ? undefined : ''

  protected complete() {
    if (this.buffer === undefined) return this.options.complete()
    this.options.next(this.buffer)
    this.buffer = ''
    this.options.complete()
  }

  protected error(err: Error) {
    this.options.error(err)
  }

  protected next(html: string) {
    if (!html) return
    if (!this.headerWrited) html = `${this.options.template.header}${html}`
    this.headerWrited = true

    if (this.buffer === undefined) return this.options.next(html)

    this.buffer += html
  }
}
