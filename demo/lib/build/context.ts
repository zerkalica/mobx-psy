import path, { sep } from 'path'

export function demoLibBuildContext({ distRoot }: { distRoot: string }) {
  const outDir = path.join(distRoot, 'public')
  const srcRoot = distRoot.replace(`${sep}-${sep}`, `${sep}`)
  const browserEntry = path.join(srcRoot, 'browser.tsx')
  const indexHtml = path.join(outDir, 'index.html')

  return {
    outDir,
    indexHtml,
    srcRoot,
    browserEntry,
  }
}
