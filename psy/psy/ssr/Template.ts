export type PsySsrTemplateScriptProps = { src: string }

export class PsySsrTemplate {
  node() {
    return undefined as undefined | any
  }

  fileName() {
    return 'index.html'
  }

  titleText() {
    return `Что-то пошло не так`
  }

  version() {
    return ''
  }

  headMeta() {
    return `
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, shrink-to-fit=no"
  />
  <title>${this.titleText()}</title>
`
  }

  noScript() {
    return 'You need to enable JavaScript to run this app.'
  }

  pkgName() {
    return 'unk'
  }

  bodyJs(): readonly PsySsrTemplateScriptProps[] {
    return []
  }

  script(item: PsySsrTemplateScriptProps) {
    return `<script src="${item.src}"></script>`
  }

  lang() {
    return 'en'
  }

  state(state: Record<string, unknown>) {
    return `
  <script id="${this.pkgName()}-state"
    type="application/json"
    crossorigin="anonymous">${JSON.stringify(state)}</script>`
  }

  renderBegin() {
    return `<!doctype html><html lang="${this.lang()}">
  <head>
    ${this.headMeta()}
  </head>
  <body>
  <noscript>${this.noScript()}</noscript>
  <div id="${this.pkgName()}-main">
`
  }

  rid() {
    return ''
  }

  error = undefined as undefined | Error

  bodyFail() {
    return `<h2>Что-то пошло не так</h2>
  <pre>Сообщите ID в тех-поддержку: <b>${this.rid()}</b></pre>
  ${this.error ? `<pre>${this.error.stack ?? 'unk'}</pre>` : ''}
`
  }

  body() {
    return this.bodyFail()
  }

  renderEnd(state?: Record<string, unknown>) {
    return `
  </div>
  ${state ? this.state(state) : ''}
  ${this.bodyJs()
    .map(item => this.script(item))
    .join('\n')}
</body></html>
`
  }

  render(state?: Record<string, unknown>) {
    return `${this.renderBegin()}
    ${this.body()}
    ${this.renderEnd(state)}`
  }
}
