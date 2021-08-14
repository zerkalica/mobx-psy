import React from 'react'
import ReactDOM from 'react-dom'

import { AcmeRouterLocation } from '@acme/router/location'
import { PsyContext } from '@psy/psy/context/Context'
import { PsyFetcher } from '@psy/psy/fetcher/Fetcher'
import { FetcherBrowser } from '@psy/psy/fetcher/Fetcher.browser'
import { PsySsrHydrator } from '@psy/psy/ssr/Hydrator'
import { PsySsrHydratorBrowser } from '@psy/psy/ssr/Hydrator.browser'
import { PsyContextProvide } from '@psy/react/context/provide'

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

  console.log(`${acmeSearchPkgName}...`)

  ReactDOM.render(
    <PsyContextProvide
      children={<AcmeSearch id={acmeSearchPkgName} />}
      parent={$}
      deps={ctx =>
        ctx
          .set(PsySsrHydrator.instance, new PsySsrHydratorBrowser(cache))
          .set(AcmeRouterLocation.instance, new AcmeRouterLocation(window))
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
