import { AcmeServerHttp } from '@acme/server/server/http'

import { AcmeSearch } from '../search'
import { AcmeSearchBootBuild } from './build'
import { acmeSearchBootConfig } from './config'

export class AcmeSearchBootServer extends AcmeServerHttp {
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
