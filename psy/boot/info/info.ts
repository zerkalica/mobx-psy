import path from 'path'

import { psyBootInfoPkg } from './pkg'
import { psyBootInfoTsConfigFind, psyBootInfoTsConfig } from './tsConfig'

export async function psyBootInfo() {
  const { pkg, pkgPath } = await psyBootInfoPkg()
  const projectDir = pkgPath ? path.dirname(pkgPath) : process.cwd()
  const tsConfigPath = psyBootInfoTsConfigFind(projectDir)

  if (!tsConfigPath) throw new Error(`tsconfig.json not found`)

  const tsConfig = psyBootInfoTsConfig(tsConfigPath)
  const {
    options: {
      outDir = path.resolve('-'),
      rootDir: srcDir = path.resolve('.'),
    },
  } = tsConfig

  const lib = pkg.source ? false : true

  return {
    lib,
    projectDir,
    outDir,
    srcDir,
    pkg,
    pkgPath,
  }
}

type PromiseValue<P>  = P extends PromiseLike<infer V> ? V : never

export type PsyBootInfo = PromiseValue<ReturnType<typeof psyBootInfo>>
