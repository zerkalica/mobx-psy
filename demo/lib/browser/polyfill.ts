import { configure } from 'mobx'
import { configurePsy } from 'mobx-psy'

import { DemoLibUiFallbackError } from '@demo/lib-ui'
import { DemoLibUiFallbackLoading } from '@demo/lib-ui'

configure({
  enforceActions: 'observed',
})

configurePsy({
  loading: DemoLibUiFallbackLoading,
  error: DemoLibUiFallbackError,
})
