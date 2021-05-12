import React from 'react'
import ReactDOM from 'react-dom'

import { DemoLibRouterLocation } from '@demo/lib-router/location'
import { PsyContext } from '@psy/core/context/Context'
import { PsyFetcher } from '@psy/core/fetcher/Fetcher'
import { FetcherBrowser } from '@psy/core/fetcher/Fetcher.browser'
import { PsySsrHydrator } from '@psy/core/ssr/Hydrator'
import { PsySsrHydratorBrowser } from '@psy/core/ssr/Hydrator.browser'
import { PsyContextProvide } from '@psy/react/context/provide'

import { demoSearchPkgName } from '../../pkgName'
import { DemoSearch } from '../../search'
import { demoSearchBootCommonBrowserConfig } from './browserConfig'

export function demoSearchBootCommonBrowser({
  fetchFn = fetch,
  $ = PsyContext.instance,
  fallbackConfig = demoSearchBootCommonBrowserConfig,
} = {}) {
  const cacheStr = document.getElementById(`${demoSearchPkgName}-state`)?.innerText
  const cache = cacheStr ? (JSON.parse(cacheStr) as Record<string, any> & { __config: typeof fallbackConfig }) : undefined
  const config = cache?.__config ?? fallbackConfig

  ReactDOM.render(
    <PsyContextProvide
      children={<DemoSearch id={demoSearchPkgName} />}
      parent={$}
      deps={ctx =>
        ctx
          .set(PsySsrHydrator.instance, new PsySsrHydratorBrowser(cache))
          .set(DemoLibRouterLocation.instance, new DemoLibRouterLocation(ctx, window as typeof window & { [Symbol.toStringTag]: string }))
          .set(
            PsyFetcher,
            class DemoSearchBootCommonBrowserFetcher extends FetcherBrowser {
              static baseUrl = config.apiUrl
              static fetch = fetchFn
            }
          )
      }
    />,
    document.getElementById(`${demoSearchPkgName}-main`)
  )
}
