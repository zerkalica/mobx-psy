import { AcmeBuildBundler } from '@acme/build/bundler'

import { acmeSearchBootConfig } from './config'

export class AcmeSearchBootBuild extends AcmeBuildBundler {
  publicUrl() {
    return acmeSearchBootConfig.browser.publicUrl
  }

  pkgName() {
    return acmeSearchBootConfig.browser.pkgName
  }
}
