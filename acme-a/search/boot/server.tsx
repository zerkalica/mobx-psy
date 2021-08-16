import React from 'react'

import { AcmeServer } from '@acme/server/server'

import { AcmeSearch } from '../search'
import { AcmeSearchBootBuild } from './build'
import { acmeSearchBootConfig } from './config'

export class AcmeSearchBootServer extends AcmeServer {
  fallbackConfig() {
    return acmeSearchBootConfig
  }

  bundlerCreate() {
    return new AcmeSearchBootBuild()
  }

  node() {
    return <AcmeSearch id={this.pkgName()} />
  }
}
