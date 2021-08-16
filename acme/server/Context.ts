import fetchRaw from 'node-fetch'

import { AcmeRouterLocation } from '@acme/router/location'
import { PsyContext } from '@psy/psy/context/Context'
import { PsyFetcher } from '@psy/psy/fetcher/Fetcher'
import { PsyLog } from '@psy/psy/log/log'
import { PsySsrHydrator } from '@psy/psy/ssr/Hydrator'
import { PsySsrHydratorNode } from '@psy/psy/ssr/Hydrator.node'

import { AcmeServerManifest, AcmeServerManifestLoader } from './Manifest'
import { AcmeServerRequest } from './request/Request'

export class AcmeServerContext {
  constructor(protected $ = PsyContext.instance) {}

  req() {
    return new AcmeServerRequest()
  }

  logger() {
    const req = this.req()
    const PsyLogParent = this.$.get(PsyLog)

    return class PsyLogNodeConfgured extends PsyLogParent {
      static context() {
        return {
          ua: req.ua(),
          url: req.url() ?? '',
          rid: req.id(),
          sid: req.sid(),
        }
      }
    } as typeof PsyLog
  }

  fetcher() {
    const requestId = () => this.req().id()
    const $ = this.$

    const apiUrl = this.apiUrl()

    const ParentFetcher = this.$.get(PsyFetcher)

    return class PsyFetcherNodeConfigured extends ParentFetcher {
      static $ = $
      static baseUrl = apiUrl
      static fetch = fetchRaw as unknown as typeof fetch
      static requestId = requestId
    }
  }

  apiUrl() {
    return '/'
  }

  browserConfig() {
    return {}
  }

  async hydrator() {
    const manifest = await this.manifest()
    return new PsySsrHydratorNode({ __config: this.browserConfig(), __files: manifest.files })
  }

  location() {
    return new AcmeRouterLocation(this.req().location())
  }

  publicDir() {
    return ''
  }

  manifest() {
    const manifestLoader = new AcmeServerManifestLoader(this.$)
    manifestLoader.publicDir = () => this.publicDir()
    return manifestLoader.load()
  }

  async build() {
    return new PsyContext(this.$)
      .set(AcmeServerManifest, await this.manifest())
      .set(PsyFetcher, this.fetcher())
      .set(PsySsrHydrator.instance, await this.hydrator())
      .set(AcmeRouterLocation.instance, this.location())
      .set(PsyLog, this.logger())
  }
}
