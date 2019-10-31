import yargs from 'yargs'
import { clean, build, watch } from './commands'
import findUp from 'find-up'
import fs from 'fs'

export async function yargsRun() {
  const configPath = await findUp(['.buildrc', '.buildrc.json'])
  const configData = await (configPath ? fs.promises.readFile(configPath).toString() : '')
  const config = configPath ? JSON.parse(configData) : {}

  yargs
    .command({
      command: 'clean',
      describe: 'Clean project dist directory',
      handler: clean,
      builder: yargs =>
        yargs.option('remove', {
          alias: 'r',
          type: 'string',
          default: 'dist,*.tsbuildinfo',
          description: 'Files to remove (glob mask) for clean command',
        }),
    })
    .command({
      command: 'build',
      describe: 'Create production build',
      handler: build,
      builder: yargs => addBuildOptions(yargs)
        .option('entry', {
          type: 'string',
          default: 'src/app/dev/browser.ts',
          description: 'Dev browser bundle entry point'
        })
        .option('bundle', {
          type: 'string',
          default: 'dist/app/public',
          description: 'Browser bundle build directory'
        }),
    })
    .command({
      command: 'watch',
      describe: 'Development watch server',
      handler: watch,
      builder: addBuildOptions,
    })
    .help()
    .config(config).argv
}

function addBuildOptions<Y extends typeof yargs>(yargsApi: Y) {
  return yargsApi
    .option('force', {
      type: 'boolean',
      default: false,
      description: 'Add --force to tsc --build',
    })
    .option('assets', {
      type: 'string',
      default: '**/*.{css,sass,less,html,png,gif,jpg,svg,md,txt,woff2,woff}',
      description: 'Resource glob mask, relative to <src>',
    })
    .option('build', {
      type: 'string',
      default: 'dist',
      description: 'Build directory',
    })
    .option('project', {
      type: 'string',
      default: process.cwd(),
      description: 'Project directory with tsconfig.json',
    })
    .option('dev', {
      type: 'string',
      default: 'dist/app/dev/server.js',
      description: 'Dev server command',
    })
    .option('public', {
      type: 'string',
      default: '/',
      description: 'Public url for bundler',
    })
    .option('src', {
      type: 'string',
      default: 'src',
      description: 'Source directory',
    })
}
