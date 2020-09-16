import { Argv } from 'yargs'
import { del } from '../sys'
import { CommandContext } from './context'

export async function commandClean({
  cleanMask,
  projectDir,
}: {
  cleanMask: string
  projectDir: string
}) {
  const cmds = cleanMask.split(',')
  await del(cmds, { cwd: projectDir })
}

export const commandCleanYargs = {
  command: 'clean',
  describe: 'Clean project dist directory',
  handler: commandClean,
  builder: <V extends CommandContext>(y: Argv<V>) =>
    y.option('cleanMask', {
      type: 'string',
      default: '-,*.tsbuildinfo,*.log',
      description: 'Clean file glob mask',
    }),
}
