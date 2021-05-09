import React from 'react'
import ReactDOM from 'react-dom'

import { demoLibRouterClient } from '@demo/lib-router/client'
import { PsyContext } from '@psy/core/context/Context'
import { PsyFetcher } from '@psy/core/fetcher/Fetcher'
import { FetcherBrowser } from '@psy/core/fetcher/Fetcher.browser'
import { PsySsrHydrator } from '@psy/core/ssr/Hydrator'
import { PsySsrHydratorBrowser } from '@psy/core/ssr/Hydrator.browser'
import { PsyContextProvide } from '@psy/react/context/provide'

import { demoSearchPkgName } from '../../pkgName'
import { DemoSearch } from '../../search'
import { demoSearchBootCommonBrowserConfig } from './browserConfig'

export function demoSearchBootCommonBrowser(
  $ = PsyContext.instance,
  win: typeof window & { [Symbol.toStringTag]?: string } & {
    [demoSearchPkgName]?: Record<string, unknown> & { __config: typeof demoSearchBootCommonBrowserConfig }
  } = window,
  config = win[demoSearchPkgName]?.__config ?? demoSearchBootCommonBrowserConfig
) {
  const cache = win[demoSearchPkgName]

  ReactDOM.render(
    <PsyContextProvide
      parent={$}
      deps={$ =>
        $.set(demoLibRouterClient, win as typeof window & { [Symbol.toStringTag]: string })
          .set(demoSearchBootCommonBrowserConfig, config)
          .set(PsySsrHydrator.instance, new PsySsrHydratorBrowser(cache))
          .set(
            PsyFetcher,
            class FetcherBrowserConfigured extends FetcherBrowser {
              static baseUrl = config.apiUrl
            }
          )
      }
    >
      <DemoSearch id={demoSearchPkgName} />
    </PsyContextProvide>,
    document.getElementById(`${demoSearchPkgName}-main`)
  )
}
