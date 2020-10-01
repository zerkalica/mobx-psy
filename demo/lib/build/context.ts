import path, { sep } from 'path'

export function demoLibBuildContext({
  distEntry = false,
  distRoot,
}: {
  distEntry?: boolean
  distRoot: string
}) {
  const outDir = path.join(distRoot, 'public')
  const srcRoot = distRoot.replace(`${sep}-${sep}`, `${sep}`)
  const browserEntry = distEntry ? path.join(distRoot, 'browser.js') : path.join(srcRoot, 'browser.tsx')
  const indexHtml = path.join(outDir, 'index.html')

  return {
    outDir,
    indexHtml,
    srcRoot,
    browserEntry,
  }
}
