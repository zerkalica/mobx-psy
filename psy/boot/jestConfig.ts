import path from 'path'

import { psyBootInfoTsConfig } from './info'

import type { Config } from '@jest/types'

export function jestConfig(pkgDir: string, { tsConfigJson = 'tsconfig.json' }) {
  const t = psyBootInfoTsConfig(path.join(pkgDir, tsConfigJson))
  const roots = t.projectReferences?.map((ref) => ref.path) ?? []
  roots.push(path.join(pkgDir, '-'))
  const config: Config.InitialOptions = {
    roots,
  }

  return config
}
