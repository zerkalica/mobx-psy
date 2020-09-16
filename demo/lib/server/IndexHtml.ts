export class DemoLibServerIndexHtml {
  constructor(
    protected options: {
      title: string
      /**
       * Only absolute path allowed
       */
      publicUrl: string
      pkgName: string
      entry?: string
    }
  ) {}

  get header() {
    return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <title>${this.options.title}</title>
    </head>
  
    <body>
      <noscript>
        You need to enable JavaScript to run this app.
      </noscript>
      <div id="${this.options.pkgName}-main">`
  }

  get body() {
    return `</div>
      <script>window["${this.options.pkgName}"] = `
  }

  get footer() {
    return `;</script>
      <script src="${this.options.publicUrl}${this.options.entry ?? 'browser'}.js"></script>
    </body>
  </html>
  `
  }

  toString() {
    return `${this.header}${this.body}{}${this.footer}`
  }
}