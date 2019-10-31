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
