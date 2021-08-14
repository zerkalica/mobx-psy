import yargs, { Argv } from 'yargs'

import { PsyBootInfo, psyBootInfo } from '../info/info'
import { commandCleanYargs } from './clean'
import { CommandContext } from './context'
import { commandPrePublishYargs } from './prePublish'

export async function command() {
  const yargs = await commandYargs()

  const commands = yargs
    .command(commandPrePublishYargs)
    .command(commandCleanYargs)
    .help()

  const argv = await commands.parse()
  console.log(argv._[0], argv.lib ? 'library' : 'application', argv.projectDir)
  if (argv._.length === 0) commands.showHelp()
}

export type Config = Partial<
    Parameters<typeof commandPrePublishYargs['handler']>[0] &
    Parameters<typeof commandCleanYargs['handler']>[0]
>

export async function commandYargs() {
  const context = await psyBootInfo()

  return addContextOptions(yargs, context)
}

function addContextOptions(
  yargs: Argv,
  p: PsyBootInfo
): Argv<CommandContext> {
  return yargs
    .option('lib', {
      type: 'boolean',
      default: p.lib,
      description: 'Project is a library?',
    })
    .option('projectDir', {
      type: 'boolean',
      default: p.projectDir,
      description: 'Project directory',
    })
    .option('outDir', {
      type: 'string',
      default: p.outDir,
      description: 'Build directory',
    })
    .option('srcDir', {
      type: 'string',
      default: p.srcDir,
      description: 'Src directory',
    })
    .option('pkgPath', {
      type: 'string',
      default: p.pkgPath,
      description: 'package.json pathname',
    })
}
