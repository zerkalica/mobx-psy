import path from 'path'

import type { Config } from '@jest/types'

export function jestConfig(pkgDir: string) {
  const config: Config.InitialOptions = {
    rootDir: path.join(pkgDir, '-'),
  }

  return config
}
