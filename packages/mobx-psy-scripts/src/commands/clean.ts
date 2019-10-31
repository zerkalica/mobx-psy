import { Argv } from 'yargs'
import { ContextOptions } from '../context'
import { del } from '../utils'

export async function clean({
  cleanMask,
  projectDir,
}: {
  cleanMask: string
  projectDir: string
}) {
  const cmds = cleanMask.split(',')
  await del(cmds, { cwd: projectDir })
}

export const cleanCommand = {
  command: 'clean',
  describe: 'Clean project dist directory',
  handler: clean,
  builder: <V extends ContextOptions>(y: Argv<V>) =>
    y.option('cleanMask', {
      type: 'string',
      default: 'dist,*.tsbuildinfo,*.log',
      description: 'Clean file glob mask',
    }),
}
