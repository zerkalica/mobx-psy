import path from 'path'

import { infoPkg } from './pkg'
import { infoTsConfigFind, infoTsConfig } from './tsConfig'

export async function info() {
  const { pkg, pkgPath } = await infoPkg()
  const projectDir = pkgPath ? path.dirname(pkgPath) : process.cwd()
  const tsConfigPath = infoTsConfigFind(projectDir)

  if (!tsConfigPath) throw new Error(`tsconfig.json not found`)

  const tsConfig = infoTsConfig(tsConfigPath)
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

export type PromiseValue<P>  = P extends PromiseLike<infer V> ? V : never

export type Info = PromiseValue<ReturnType<typeof info>>
