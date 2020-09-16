import { configure } from 'mobx'
import { configurePsy } from 'mobx-psy'

import { DemoLibUiFallbackError } from '@demo/lib-ui/fallback/error'
import { DemoLibUiFallbackLoading } from '@demo/lib-ui/fallback/loading'

configure({
  enforceActions: 'observed',
})

configurePsy({
  loading: DemoLibUiFallbackLoading,
  error: DemoLibUiFallbackError,
})
