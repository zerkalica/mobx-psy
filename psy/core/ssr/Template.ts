export class PsySsrTemplate {
  static readonly instance = new PsySsrTemplate()

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
