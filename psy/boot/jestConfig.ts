import path from 'path'

import { psyBootInfoTsConfig } from './info'

import type { Config } from '@jest/types'

const resolver = path.join(__dirname, 'resolver.js')

export function jestConfig(pkgDir: string, { tsConfigJson = 'tsconfig.json', outDir = '-' } = {}) {
  const t = psyBootInfoTsConfig(path.join(pkgDir, tsConfigJson))
  const roots = t.projectReferences?.map(ref => path.join(ref.path, outDir)) ?? []
  roots.push(path.join(pkgDir, outDir))
  const config: Config.InitialOptions = {
    roots,
    // https://github.com/facebook/jest/issues/9771#issuecomment-841624042
    resolver,
  }

  return config
}
