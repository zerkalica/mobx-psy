import path from 'path'
import glob from 'globby'
import { promises as fs, constants } from 'fs'
import del from 'del'
import { attach, spawn as exitsSpawn } from 'exits'

attach()

export { glob, del }

export async function spawn(program: string, args: string[], cwd: string) {
  const key = `${program} ${args.join(' ')}`
  console.log(`exec "${key}"`)
  const spawned = exitsSpawn(program, args, {
    stdio: 'inherit',
    cwd,
  })

  const signal = await spawned.promise
  if (signal) console.log(`Exiting "${key}" ${signal}`)
}

export async function touch(file: string) {
  await fs.mkdir(path.dirname(file), { recursive: true })
  const handle = await fs.open(file, 'w')
  await handle.close()
}

export async function exists(file: string) {
  try {
    await fs.access(file, constants.F_OK)
    return true
  } catch (error) {
    return false
  }
}

export function createCopy() {
  return copy.bind(null, '', [])
}

async function copy(
  prevKey: string,
  prevFiles: string[],
  {
    resourcesMask,
    srcDir,
    outDir,
    createEmpty = false
  }: {
    resourcesMask: string
    srcDir: string
    outDir: string
    createEmpty?: boolean
  }
) {
  const files = await glob(resourcesMask.split(';'), { cwd: srcDir })
  const outFiles = files.map(file => path.join(outDir, file))
  const key = outFiles.join(',')
  if (key === prevKey) return
  prevKey = key

  const outFilesSet = new Set(outFiles)
  const deleteFiles = prevFiles.filter(file => !outFilesSet.has(file))
  prevFiles = outFiles

  await Promise.all([
    Promise.all(deleteFiles.map(fs.unlink)),
    Promise.all(createEmpty
      ? outFiles.map(touch)
      : files.map(async name => {
          const dest = path.join(outDir, name)

          await fs.mkdir(path.dirname(dest), { recursive: true })
          await fs.copyFile(path.join(srcDir, name), dest)
      })
    ),
  ])

  if (outFiles.length > 0) console.log(`Created ${outFiles.length} resources`)

  if (deleteFiles.length > 0)
    console.log(`Deleted ${deleteFiles.length} resources`)
}
