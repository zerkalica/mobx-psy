export const indexHtml = ({
  publicUrl,
  entry,
}: {
  publicUrl: string
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
    <link type="text/css" rel="stylesheet" href="${publicUrl}browser.css">
  </head>

  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="mobx-psy-examples"></div>
    <script>window["mobx-psy-examples-state"]</script>
    <script src="${publicUrl}${entry}"></script>
  </body>
</html>
`
