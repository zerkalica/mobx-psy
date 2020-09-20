import findUp from 'find-up'
import glob from 'globby'
import path from 'path'

import { psyBootInfoPkgSync } from './pkg'

export function psyBootInfoWorkspacesSync(srcRoot: string = process.cwd()) {

  let workspaceRoot = srcRoot
  let workspaces: string[] | undefined

  do {
    const pkgPath = findUp.sync('package.json', { cwd: workspaceRoot })

    if (! pkgPath) return undefined

    const p = psyBootInfoPkgSync(pkgPath)
    workspaces = p?.pkg.workspaces

    workspaceRoot = path.dirname(workspaceRoot)
  } while (! workspaces )

  return glob
    .sync(workspaces.map(ws => `${ws}/package.json`), { cwd: workspaceRoot })
    .map(pkgPath => psyBootInfoPkgSync(path.join(workspaceRoot, pkgPath)))
}
