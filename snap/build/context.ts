import path, { sep } from 'path'

export function snapBuildContext({ distRoot }: { distRoot: string }) {
  const outDir = path.join(distRoot, 'public')
  const srcRoot = distRoot.replace(`${sep}-${sep}`, `${sep}`)
  const browserEntry = path.join(distRoot, 'browser')
  const indexHtml = path.join(outDir, 'index.html')

  return {
    outDir,
    indexHtml,
    srcRoot,
    browserEntry,
  }
}
