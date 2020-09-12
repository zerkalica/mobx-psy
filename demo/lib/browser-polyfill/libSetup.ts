import { configure } from 'mobx'
import { configurePsy } from 'mobx-psy'

import { DemoLibUiFallbackError, DemoLibUiFallbackLoading } from '@demo/lib-ui'

configure({
  enforceActions: 'observed',
})

configurePsy({
  loading: DemoLibUiFallbackLoading,
  error: DemoLibUiFallbackError,
})
