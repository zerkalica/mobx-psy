import path from 'path'
import util from 'util'
import globRaw from 'glob'
import fs from 'fs'

import { ContextOptions } from '../addContextOptions'

import { srcDir, distDir } from './build'

const glob = util.promisify(globRaw)
const open = util.promisify(fs.open)
const close = util.promisify(fs.close)
const mkdir = util.promisify(fs.mkdir)

export const assetsMask = '**/*.{css,sass,less,html,png,gif,jpg,svg,md,txt,woff2,woff}'

export async function makeAssets({ project }: ContextOptions) {
  const files = await glob(assetsMask, { cwd: path.join(project, srcDir) })
  const outFiles = files.map(file => path.join(project, distDir, file))

  const nonExistent = await Promise.all(outFiles.map(file => isExists(file)))

  const newFiles = nonExistent
    .filter(([isExists]) => isExists)
    .map(([, file]) => file)

  await Promise.all(newFiles.map(touch))
}

async function touch(file: string) {
  await mkdir(path.dirname(file), { recursive: true })
  const handle = await open(file, 'w')
  await close(handle)
}

async function isExists(file: string) {
  try {
    await fs.promises.access(file)
    return [true, file] as const
  } catch (error) {
    return [false, file] as const
  }
}
