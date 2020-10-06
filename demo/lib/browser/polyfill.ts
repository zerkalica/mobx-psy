import { configure } from 'mobx'
import { psyMobxReactConfigure } from '@psy/mobx-react/config.js'

import { DemoLibUiFallbackError } from '@demo/lib-ui/fallback/error.js'
import { DemoLibUiFallbackLoading } from '@demo/lib-ui/fallback/loading.js'

configure({
  enforceActions: 'observed',
})

psyMobxReactConfigure({
  loading: DemoLibUiFallbackLoading,
  error: DemoLibUiFallbackError,
})
