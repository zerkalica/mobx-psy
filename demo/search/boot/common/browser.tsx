import React from 'react'
import ReactDOM from 'react-dom'

import { demoLibRouterClient } from '@demo/lib-router/client'
import { PsyContextProvide } from '@psy/context/react'
import { PsyContextRegistry } from '@psy/context/Registry'
import { Fetcher } from '@psy/ssr/Fetcher'
import { FetcherBrowser } from '@psy/ssr/FetcherBrowser'
import { Hydrator, HydratorBrowser } from '@psy/ssr/Hydrator'

import { demoSearchPkgName } from '../../pkgName'
import { DemoSearch } from '../../search'
import { demoSearchBootCommonBrowserConfig } from './browserConfig'

export function demoSearchBootCommonBrowser(
  $: PsyContextRegistry,
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
          .set(Hydrator, new HydratorBrowser(cache))
          .set(Fetcher, new FetcherBrowser({ apiUrl: config.apiUrl }))
      }
    >
      <DemoSearch id={demoSearchPkgName} />
    </PsyContextProvide>,
    document.getElementById(`${demoSearchPkgName}-main`)
  )
}
