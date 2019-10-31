import yargs, { Argv } from 'yargs'
import { createContext, ContextOptions } from './createContext'

export async function createContextYargs() {
  const context = await createContext()
  return addContextOptions(yargs, context)
}

function addContextOptions(
  yargs: Argv,
  { outDir, lib, srcDir, projectDir }: ContextOptions
): Argv<ContextOptions> {
  return yargs
    .option('lib', {
      type: 'boolean',
      default: lib,
      description: 'Project is a library?',
    })
    .option('projectDir', {
      type: 'boolean',
      default: projectDir,
      description: 'Project directory',
    })
    .option('outDir', {
      type: 'string',
      default: outDir,
      description: 'Build directory',
    })
    .option('srcDir', {
      type: 'string',
      default: srcDir,
      description: 'Src directory',
    })
}
