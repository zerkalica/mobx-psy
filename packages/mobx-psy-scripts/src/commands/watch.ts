import path from 'path'
import { Argv } from 'yargs'

import { ContextOptions } from '../context'
import { makeAssets, makeAssetsCommand } from './makeAssets'
import { spawn, exists } from '../utils'

export async function watch({
  target,
  assetMask,
  srcDir,
  outDir,
  projectDir,
}: ContextOptions &
  Parameters<typeof makeAssets>[0] & {
    target: string
  }) {
  const devServer = path.join(outDir, 'app', target, 'watch.js')
  const devServerSrc = path.join(srcDir, 'app', target, 'watch.ts')
  const hasServer = await exists(devServerSrc)

  if (hasServer) {
    await makeAssets({ srcDir, assetMask, outDir })
    await spawn('tsc', ['--build'], projectDir)
    await spawn('node', [devServer], projectDir)
  } else {
    await spawn('tsc', ['--build', '--watch'], projectDir)
  }
}

export const watchCommand = {
  command: 'watch',
  describe: 'Development server',
  handler: watch,
  builder: <V extends ContextOptions>(y: Argv<V>) =>
    makeAssetsCommand.builder(y).positional('target', {
      type: 'string',
      default: 'dev',
      description: 'src/app/<target>',
    }),
}
