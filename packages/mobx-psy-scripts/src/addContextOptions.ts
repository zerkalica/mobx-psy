import yargs from 'yargs'

export type ContextOptions = yargs.Arguments<ContextOptionsRaw>

export interface ContextOptionsRaw {
  lib: boolean
  project: string
  public: string
}

export function addContextOptions<Y extends typeof yargs>(
  yargs: Y,
  isApp: boolean,
  projectDir: string
) {
  return yargs
    .option('lib', {
      type: 'boolean',
      default: !isApp,
      description: 'yes, if project is a library',
    })
    .option('project', {
      type: 'string',
      default: projectDir,
      description: 'Project directory with tsconfig.json',
    })
    .option('public', {
      type: 'string',
      default: '/',
      description: 'Public url for bundler',
    })
}
