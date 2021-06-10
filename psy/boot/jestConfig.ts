import path from 'path'

import { psyBootInfoTsConfig } from './info'

import type { Config } from '@jest/types'

export function jestConfig(pkgDir: string, { tsConfigJson = 'tsconfig.json', outDir = '-' } = {}) {
  const t = psyBootInfoTsConfig(path.join(pkgDir, tsConfigJson))
  const roots = t.projectReferences?.map(ref => path.join(ref.path, outDir)) ?? []
  roots.push(path.join(pkgDir, outDir))
  const config: Config.InitialOptions = {
    roots,
  }

  return config
}
