import findUp from 'find-up'
import fs from 'fs'
import yargs from 'yargs'

import { addContextOptions, ContextOptions } from './addContextOptions'
import { buildCommand, cleanCommand, watchCommand } from './commands'

export async function yargsRun() {
  const configPath = await findUp(['.buildrc', '.buildrc.json'])
  const configData = await (configPath ? fs.promises.readFile(configPath) : '')
  const config: ContextOptions = configPath
    ? JSON.parse(configData.toString())
    : {}

  const tsConfigDir = await findUp('tsconfig.json')
  const projectDir = tsConfigDir || process.cwd()

  const packageJsonPath = await findUp('package.json')

  const packageJsonData = await (packageJsonPath
    ? fs.promises.readFile(packageJsonPath)
    : '')
  const pkg: Pkg = packageJsonData ? JSON.parse(packageJsonData.toString()) : {}

  const isApp = pkg.private || false

  const y = yargs
    .command(cleanCommand)
    .command(buildCommand)
    .command(watchCommand)

  addContextOptions(y, isApp, projectDir)
    .help()
    .config(config).argv
}

export interface Pkg {
  private?: boolean
}
