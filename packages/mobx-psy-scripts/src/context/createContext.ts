import { loadPkgJson } from './loadPkgJson'
import { loadTsConfig, findTsConfig } from '../ts'
import path from 'path'

export interface ContextOptions {
  lib: boolean
  outDir: string
  srcDir: string
  projectDir: string
}

export async function createContext() {
  const { pkg, pkgPath } = await loadPkgJson()
  const projectDir = pkgPath ? path.dirname(pkgPath) : process.cwd()
  const tsConfigPath = await findTsConfig(projectDir)
  if (!tsConfigPath) throw new Error(`tsconfig.json not found`)
  const tsConfig = await loadTsConfig(tsConfigPath)
  const {
    options: {
      outDir = path.resolve('dist'),
      rootDir: srcDir = path.resolve('src'),
    },
  } = tsConfig

  const lib = pkg.source ? false : true

  const context: ContextOptions = {
    lib,
    srcDir,
    outDir,
    projectDir,
  }

  return context
}
