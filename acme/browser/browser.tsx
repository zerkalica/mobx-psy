import type React from 'react'
import ReactDOM from 'react-dom'

import { AcmeRouterLocation } from '@acme/router/location'
import { PsyContext } from '@psy/psy/context/Context'
import { PsyFetcher } from '@psy/psy/fetcher/Fetcher'
import { FetcherBrowser } from '@psy/psy/fetcher/Fetcher.browser'
import { PsySsrHydrator } from '@psy/psy/ssr/Hydrator'
import { PsySsrHydratorBrowser } from '@psy/psy/ssr/Hydrator.browser'
import { PsyReactProvide } from '@psy/react/provide'

export class AcmeBrowser {
  constructor(protected $ = PsyContext.instance) {}

  fallbackConfig() {
    return { apiUrl: '/', pkgName: '' }
  }

  protected pkgName() {
    return this.fallbackConfig().pkgName
  }

  node() {
    return undefined as React.ReactNode | undefined
  }

  fetcher() {
    return window.fetch
  }

  protected cacheCached: unknown = undefined

  cache() {
    const fallbackConfig = this.fallbackConfig()
    type C = Record<string, any> & { __config: typeof fallbackConfig }

    if (this.cacheCached) return this.cacheCached as C

    const cacheStr = document.getElementById(`${this.pkgName()}-state`)?.innerText
    const cache = cacheStr ? (JSON.parse(cacheStr) as C) : undefined

    this.cacheCached = cache

    return cache
  }

  config() {
    const cache = this.cache()
    return cache?.__config ?? this.fallbackConfig()
  }

  hydrator() {
    const cache = this.cache()
    return new PsySsrHydratorBrowser(cache)
  }

  fetcherConfigured() {
    const fetchFn = this.fetcher()
    const config = this.config()

    return class AcmeBrowserFetcher extends FetcherBrowser {
      static baseUrl = config.apiUrl
      static fetch = fetchFn
    }
  }

  protected location() {
    return new AcmeRouterLocation(window)
  }

  protected setup(ctx: PsyContext) {
    return ctx
      .set(PsySsrHydrator.instance, this.hydrator())
      .set(AcmeRouterLocation.instance, this.location())
      .set(PsyFetcher, this.fetcherConfigured())
  }

  start() {
    const node = <PsyReactProvide children={this.node()} parent={this.$} deps={this.setup.bind(this)} />
    ReactDOM.render(node, document.getElementById(`${this.pkgName()}-main`))
  }
}
