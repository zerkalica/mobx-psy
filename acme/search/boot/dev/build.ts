import '@snap/server/polyfill'

import { promises as fs } from 'fs'

import { PsySsrTemplate } from '@psy/core/ssr/Template'
import { snapBuildBundler } from '@snap/build/bundler'

import { acmeSearchPkgName } from '../../pkgName'
import { acmeSearchBootDevBrowserConfig } from './browserConfig'

const distRoot = __dirname

async function bundle() {
  const manifest = await snapBuildBundler({
    publicUrl: acmeSearchBootDevBrowserConfig.publicUrl,
    distRoot,
    pkgName: acmeSearchPkgName,
  }).bundle()

  const template = new PsySsrTemplate()
  template.titleText = () => 'test'
  template.pkgName = () => acmeSearchPkgName
  template.bodyJs = () => [{ src: manifest.entry }]
  const html = `${template.renderBegin()}${template.renderEnd({ __files: manifest.files })}`

  await fs.writeFile(manifest.indexHtml, html)
}

bundle()
