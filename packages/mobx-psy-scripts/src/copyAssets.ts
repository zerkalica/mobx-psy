import path from 'path'
import util from 'util'
import globRaw from 'glob'
import fs from 'fs'

const glob = util.promisify(globRaw)
const open = util.promisify(fs.open)
const close = util.promisify(fs.close)
const mkdir = util.promisify(fs.mkdir)

export const defaultSrcDir = 'src'
export const defaultPattern =
  '**/*.{css,sass,less,html,png,gif,jpg,svg,md,txt,woff2,woff}'
export const defaultOutDir = 'dist'

export async function copyAssets({
  cwd = defaultSrcDir,
  pattern = defaultPattern,
  outDir = defaultOutDir,
}: {
  cwd?: string
  outDir?: string
  pattern?: string
} = {}) {
  const files = await glob(pattern, { cwd })
  const outFiles = files.map(file => path.join(outDir, file))
  await Promise.all(
    outFiles.map(file => mkdir(path.dirname(file), { recursive: true }))
  )
  const handles = await Promise.all(outFiles.map(file => open(file, 'w')))
  await Promise.all(handles.map(handle => close(handle)))
}
