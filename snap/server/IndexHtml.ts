import { PsySsrTemplate } from '@psy/core/ssr/Template'

export class SnapServerIndexHtml extends PsySsrTemplate {
  constructor(
    protected options: Readonly<{
      title?: string
      entry?: string
      pkgName: string
    }>
  ) {
    super()
  }

  get header() {
    return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <title>${this.options.title ?? 'Debug title'}</title>
    </head>
  
    <body>
      <noscript>
        You need to enable JavaScript to run this app.
      </noscript>
      <div id="${this.options.pkgName}-main">`
  }

  get body() {
    return `</div>
      <script id="${this.options.pkgName}-state" type="application/json" crossorigin="anonymous">`
  }

  get footer() {
    return `</script>
      ${this.options.entry ? `<script src="${this.options.entry}"></script>` : ''}
    </body>
  </html>
  `
  }
}
