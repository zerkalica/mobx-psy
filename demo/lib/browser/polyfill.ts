import { configure } from 'mobx'
import { psyMobxReactConfigure } from '@psy/mobx-react/config'

import { DemoLibUiFallbackError } from '@demo/lib-ui/fallback/error'
import { DemoLibUiFallbackLoading } from '@demo/lib-ui/fallback/loading'

configure({
  enforceActions: 'observed',
})

psyMobxReactConfigure({
  loading: DemoLibUiFallbackLoading,
  error: DemoLibUiFallbackError,
})
