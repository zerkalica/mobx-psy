import React from 'react'
import ReactDOM from 'react-dom'

import { PsyContext } from '@psy/core/context/Context'
import { PsyFetcher } from '@psy/core/fetcher/Fetcher'
import { FetcherBrowser } from '@psy/core/fetcher/Fetcher.browser'
import { PsySsrHydrator } from '@psy/core/ssr/Hydrator'
import { PsySsrHydratorBrowser } from '@psy/core/ssr/Hydrator.browser'
import { PsyContextProvide } from '@psy/react/context/provide'
import { SnapRouterLocation } from '@snap/router/location'

import { acmeSearchPkgName } from '../../pkgName'
import { AcmeSearch } from '../../search'
import { acmeSearchBootCommonBrowserConfig } from './browserConfig'

export function acmeSearchBootCommonBrowser({
  fetchFn = fetch,
  $ = PsyContext.instance,
  fallbackConfig = acmeSearchBootCommonBrowserConfig,
} = {}) {
  const cacheStr = document.getElementById(`${acmeSearchPkgName}-state`)?.innerText
  const cache = cacheStr ? (JSON.parse(cacheStr) as Record<string, any> & { __config: typeof fallbackConfig }) : undefined
  const config = cache?.__config ?? fallbackConfig

  ReactDOM.render(
    <PsyContextProvide
      children={<AcmeSearch id={acmeSearchPkgName} />}
      parent={$}
      deps={ctx =>
        ctx
          .set(PsySsrHydrator.instance, new PsySsrHydratorBrowser(cache))
          .set(SnapRouterLocation.instance, new SnapRouterLocation(window))
          .set(
            PsyFetcher,
            class AcmeSearchBootCommonBrowserFetcher extends FetcherBrowser {
              static baseUrl = config.apiUrl
              static fetch = fetchFn
            }
          )
      }
    />,
    document.getElementById(`${acmeSearchPkgName}-main`)
  )
}
