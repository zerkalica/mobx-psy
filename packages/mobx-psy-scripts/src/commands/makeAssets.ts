import path from 'path'
import { promises as fs } from 'fs'

import { Argv } from 'yargs'
import { ContextOptions } from '../context/createContext'
import { touch, glob } from '../utils'

let prevKey = ''

let prevFiles: string[] = []

export async function makeAssets({
  assetMask,
  srcDir,
  outDir,
}: Pick<ContextOptions, 'srcDir' | 'outDir'> & { assetMask: string }) {
  const files = await glob([assetMask], { cwd: srcDir })
  const outFiles = files.map(file => path.join(outDir, file))
  const key = outFiles.join(',')
  if (key === prevKey) return
  prevKey = key

  const outFilesSet = new Set(outFiles)
  const deleteFiles = prevFiles.filter(file => !outFilesSet.has(file))
  prevFiles = outFiles

  await Promise.all([
    Promise.all(deleteFiles.map(fs.unlink)),
    Promise.all(outFiles.map(touch)),
  ])

  if (outFiles.length > 0) console.log(`Created ${outFiles.length} assets`)

  if (deleteFiles.length > 0)
    console.log(`Deleted ${deleteFiles.length} assets`)
}

export const makeAssetsCommand = {
  command: 'make-assets',
  describe: 'Create asset stubs for running prerender server without webpack',
  handler: makeAssets,
  builder: <V extends ContextOptions>(y: Argv<V>) =>
    y.option('assetMask', {
      type: 'string',
      default: '**/*.{css,sass,less,html,png,gif,jpg,svg,md,txt,woff2,woff}',
      description: 'Assets glob mask, relative to src dir',
    }),
}
