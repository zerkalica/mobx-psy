import '@snap/server/polyfill'

import { promises as fs } from 'fs'

import { snapBuildBundler } from '@snap/build/bundler'
import { SnapServerIndexHtml } from '@snap/server/IndexHtml'

import { acmeSearchPkgName } from '../../pkgName'
import { acmeSearchBootDevBrowserConfig } from './browserConfig'

const distRoot = __dirname

async function bundle() {
  const manifest = await snapBuildBundler({
    ...acmeSearchBootDevBrowserConfig,
    distRoot,
  }).bundle()

  const html = new SnapServerIndexHtml({
    pkgName: acmeSearchPkgName,
    entry: manifest.entry,
  })

  await fs.writeFile(manifest.indexHtml, `${html}`)
}

bundle()
