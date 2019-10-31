import util from 'util'
import child_process from 'child_process'
import { makeAssets } from './makeAssets'
import Bundler from 'parcel-bundler'
import path from 'path'

// import { bundleRoot, public } from '../common/variables'

const exec = util.promisify(child_process.exec)

//"build": "tsc --build && mobx-psy-scripts-assets && parcel build src/app/prod/browser.ts --out-dir=dist/public --public-url=/mobx-psy",

export async function build(
  props: {entry: string, public: string} & Parameters<typeof makeAssets>[0]
) {
  const {stdout, stderr} = await exec('tsc --build')
  console.log(stdout)
  if (stderr) console.error(stderr)
  await makeAssets(props)

  const bundlerBrowser = new Bundler(props.entry, {
    outDir: props.build,
    publicUrl: props.public,
    contentHash: false,
  })

  await bundlerBrowser.bundle()
}
