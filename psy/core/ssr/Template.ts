export type PsySsrTemplateScriptProps = { src: string }

export class PsySsrTemplate {
  static readonly instance = new PsySsrTemplate()

  titleText() {
    return `Debug title`
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

  fallbackStr() {
    return 'Что-то пошло не так'
  }

  renderError(error: Error, traceId: string) {
    return `<h2>${this.fallbackStr()}</h2>
  <div>Id: <pre>${traceId}</pre></div>
`
  }
}
