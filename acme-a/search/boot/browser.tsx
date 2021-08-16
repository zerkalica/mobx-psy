import React from 'react'

import { AcmeBrowser } from '@acme/browser/browser'

import { AcmeSearch } from '../search'
import { acmeSearchBootConfigBrowser } from './configBrowser'

export class AcmeSearchBootBrowser extends AcmeBrowser {
  fallbackConfig() {
    return acmeSearchBootConfigBrowser
  }

  node() {
    return <AcmeSearch id={this.pkgName()} />
  }
}
