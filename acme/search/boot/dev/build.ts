import '@snap/server/polyfill'

import { promises as fs } from 'fs'

import { PsySsrTemplate } from '@psy/core/ssr/Template'
import { SnapBuildBundler } from '@snap/build/bundler'

import { acmeSearchPkgName } from '../../pkgName'
import { acmeSearchBootDevBrowserConfig } from './browserConfig'

const distRoot = __dirname

async function bundle() {
  const publicUrl = acmeSearchBootDevBrowserConfig.publicUrl
  const pkgName = acmeSearchPkgName
  const manifest = await new SnapBuildBundler({
    publicUrl,
    distRoot,
    pkgName,
  }).bundle()

  const template = new PsySsrTemplate()
  template.pkgName = () => pkgName
  template.bodyJs = () => Object.values(manifest.entries).map(src => ({ src: publicUrl + src }))

  await fs.writeFile(manifest.indexHtml, template.render({ __files: manifest.files }))
}

bundle()
