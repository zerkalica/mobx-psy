import { HydratedState } from 'mobx-psy'

export function stateToScriptTag(
  pkgName: string,
  state: HydratedState
): string {
  return `\n<script>window["${pkgName}"] = ${JSON.stringify(state)};</script>\n`
}

/**
 * @example
 ```html
<body>
  <div id="mobx-psy-examples"></div>
  <script>window["mobx-psy-examples-state"]</script>
</body>
```
 */
export function extractHtmlParts({
  pkgName,
  stateKey,
  html,
}: {
  pkgName: string
  stateKey: string
  html: string
}): { header: string; footerPre: string; footerPost: string } {
  const divTag = `<div id="${pkgName}">`
  const divPos = html.indexOf(divTag)
  const stateTag = `window["${stateKey}"]`
  const statePos = html.indexOf(stateTag, divPos)
  if (divPos === -1 || statePos === -1)
    throw new Error(`${divTag} or ${stateTag} not found in ${html}`)
  const header = html.substring(0, divPos + divTag.length)
  const footerPre = html.substring(divPos + divTag.length, statePos + stateTag.length)
  const footerPost = html.substring(statePos + stateTag.length)

  return { header, footerPre, footerPost }
}
