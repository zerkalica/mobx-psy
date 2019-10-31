import path from 'path'
import { Argv } from 'yargs'
import { ContextOptions } from '../context/createContext'
import { makeAssets, makeAssetsCommand } from './makeAssets'
import { spawn, del, exists } from '../utils'

export interface BuildConfig {
  publicUrl: string
  minify?: boolean
}

export async function build({
  target,
  assetMask,
  srcDir,
  outDir,
  projectDir,
}: ContextOptions &
  Parameters<typeof makeAssets>[0] & {
    target: string
  }) {
  await spawn('tsc', ['--build'], projectDir)
  await del(['**/__tests__'], { cwd: outDir })
  await makeAssets({ assetMask, srcDir, outDir })

  const buildCmd = path.join(outDir, 'app', target, 'build.js')
  const hasBuild = await exists(buildCmd)
  if (hasBuild) {
    await spawn('node', [buildCmd], projectDir)
  }
}

export const buildCommand = {
  command: 'build',
  describe: 'Create production build',
  handler: build,
  builder: <V extends ContextOptions>(y: Argv<V>) =>
    makeAssetsCommand.builder(y).positional('target', {
      type: 'string',
      default: 'prod',
      description: 'src/app/<target>',
    }),
}
