import path from 'path'
import util from 'util'
import globRaw from 'glob'
import fs from 'fs'

const glob = util.promisify(globRaw)
const open = util.promisify(fs.open)
const close = util.promisify(fs.close)
const mkdir = util.promisify(fs.mkdir)

export async function makeAssets({
  src,
  assets,
  build,
}: {
  src: string
  assets: string
  build: string
}) {
  const files = await glob(assets, { cwd: src })
  const outFiles = files.map(file => path.join(build, file))
  await Promise.all(
    outFiles.map(file => mkdir(path.dirname(file), { recursive: true }))
  )
  const handles = await Promise.all(outFiles.map(file => open(file, 'w')))
  await Promise.all(handles.map(handle => close(handle)))
}
