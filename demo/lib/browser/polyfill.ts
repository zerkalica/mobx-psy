import { configure } from 'mobx'
import { configurePsy } from '@psy/mobx-react'

import { DemoLibUiFallbackError } from '@demo/lib-ui/fallback/error'
import { DemoLibUiFallbackLoading } from '@demo/lib-ui/fallback/loading'

configure({
  enforceActions: 'observed',
})

configurePsy({
  loading: DemoLibUiFallbackLoading,
  error: DemoLibUiFallbackError,
})
