import child_process from 'child_process'
import Bundler from 'parcel-bundler'
import path from 'path'
import util from 'util'

import { ContextOptions } from '../addContextOptions'
import { makeAssets } from './makeAssets'

const exec = util.promisify(child_process.exec)

export const srcDir = 'src'
export const distDir = 'dist'

export const browserEntry = 'src/app/prod/browser.ts'
export const bundleDir = 'dist/public'

//"build": "tsc --build && mobx-psy-scripts-assets && parcel build src/app/prod/browser.ts --out-dir=dist/public --public-url=/mobx-psy",

export async function build(props: ContextOptions) {
  console.log('Compiling...')
  const { stdout, stderr } = await exec('tsc --build', { cwd: props.project })
  console.log(stdout)
  if (stderr) throw new Error(stderr)
  console.log(`Make assets in ${path.join(props.project, distDir)}`)
  await makeAssets(props)
  if (!props.lib) {
    const bundlerBrowser = new Bundler(path.join(props.project, browserEntry), {
      outDir: path.join(props.project, bundleDir),
      publicUrl: props.public,
      contentHash: false,
      watch: false,
    })

    await bundlerBrowser.bundle()
  }

  console.log('Done')
}

export const buildCommand = {
  command: 'build',
  describe: 'Create production build',
  handler: build,
}
