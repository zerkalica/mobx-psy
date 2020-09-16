import path from 'path'
import { promises as fs } from 'fs'

import { Argv } from 'yargs'
import { createCopy } from '../sys'
import { CommandContext } from './context'
import { infoPkg } from '../info/pkg'

const copy = createCopy()

const distRegex = /^.*\//

export async function commandPrePublish({
  resourcesMask,
  srcDir,
  outDir,
  pkgPath
}: CommandContext & { resourcesMask: string }) {
  await copy({ resourcesMask, srcDir, outDir })
  const { pkg: pkgSrc } = await infoPkg(pkgPath)

  const pkg = {
    ...pkgSrc,
    typings: pkgSrc.typings?.replace(distRegex, ''),
    main: pkgSrc.main?.replace(distRegex, ''),
    module: pkgSrc.module?.replace(distRegex, ''),
    browser: pkgSrc.browser?.replace(distRegex, ''),
  }

  await fs.writeFile(path.join(outDir, 'package.json'), JSON.stringify(pkg, null, '  '))
}

export const commandPrePublishYargs = {
  command: 'prepublish',
  describe: 'Copy package.json to build directory and fix main section',
  handler: commandPrePublish,
  builder: <V extends CommandContext>(y: Argv<V>) =>
    y.option('resourcesMask', {
      type: 'string',
      default: '!(node_modules)/*.{npmrc,npmignore,md,png};doc/**;bin/**',
      description: 'Resources glob mask, relative to src dir',
    }),
}
