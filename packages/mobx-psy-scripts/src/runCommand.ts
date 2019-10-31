import { createContextYargs } from './context'
import { buildCommand, cleanCommand, watchCommand } from './commands'

export async function runCommand() {
  const yargs = await createContextYargs()
  const args = yargs.parse()
  console.log(args._[0], args.lib ? 'library' : 'application', args.projectDir)

  const commands = yargs
    .command(buildCommand)
    .command(watchCommand)
    .command(cleanCommand)
    .help()
  const argv = commands.parse()
  if (!argv._) commands.showHelp()
}

export type Config = Partial<
  Parameters<typeof buildCommand['handler']>[0] &
    Parameters<typeof watchCommand['handler']>[0] &
    Parameters<typeof cleanCommand['handler']>[0]
>
