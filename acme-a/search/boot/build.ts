import { AcmeBuild } from '@acme/build/build'

import { acmeSearchBootConfig } from './config'

export class AcmeSearchBootBuild extends AcmeBuild {
  publicUrl() {
    return acmeSearchBootConfig.browser.publicUrl
  }

  pkgName() {
    return acmeSearchBootConfig.browser.pkgName
  }
}
