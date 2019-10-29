export const indexHtml = ({
  publicUrl,
  pkgName,
  entry
}: {
  publicUrl: string
  pkgName: string
  entry: string
}) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <title>React Flats Demo App</title>
    <link type="text/css" rel="stylesheet" href="${publicUrl}${entry}.css">
  </head>

  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="${pkgName}"></div>
    <script>window["${pkgName}-state"]</script>
    <script src="${publicUrl}${entry}.js"></script>
  </body>
</html>
`
