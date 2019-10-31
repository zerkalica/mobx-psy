import yargs from 'yargs'
import { clean, build, watch } from './commands'

export function yargsRun() {
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
      builder: addBuildOptions,
    })
    .command({
      command: 'watch',
      describe: 'Development watch server',
      handler: watch,
      builder: yargs => addBuildOptions(yargs)
        .option('entry', {
          type: 'string',
          default: 'src/app/dev/browser.ts',
          description: 'Dev browser bundle entry point'
        }),
    })
    .config().argv
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
    .option('dev-server', {
      type: 'string',
      default: 'dist/app/dev/server.js',
      description: 'Dev server command',
    })
    .option('src', {
      type: 'string',
      default: 'src',
      description: 'Source directory',
    })
}
