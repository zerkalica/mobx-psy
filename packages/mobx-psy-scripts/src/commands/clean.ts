import rimrafRaw from 'rimraf'
import util from 'util'

import { ContextOptions } from '../addContextOptions'

const rimraf = util.promisify(rimrafRaw)

const removeMask = 'dist,*.tsbuildinfo,*.log'

export async function clean(context: ContextOptions) {
  console.log(`rimraf ${removeMask}`)
  const cmds = removeMask.split(',')
  await Promise.all(cmds.map(cmd => rimraf(cmd)))
}

export const cleanCommand = {
  command: 'clean',
  describe: 'Clean project dist directory',
  handler: clean,
}
